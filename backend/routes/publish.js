import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import { coerceResume } from '../../shared/resume-schema.js';
import { renderPortfolio } from '../../shared/render.js';
import { getLayout } from '../../shared/style-presets.js';
import { deploy, destroyDeployment } from '../services/deploy/index.js';
import { requireAuth } from '../lib/auth.js';
import { supabase } from '../lib/supabase.js';

const router = Router();
const IMAGE_BUCKET = 'portfolio-images';
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed.'), false);
    }
  }
});

function imageStorageError(message, status = 502) {
  const error = new Error(message);
  error.code = 'image_upload_failed';
  error.status = status;
  return error;
}

function hasStorageStatus(error, status) {
  return error?.statusCode === status || error?.statusCode === String(status);
}

async function ensureImageBucket() {
  const { data: bucket, error: bucketError } = await supabase.storage.getBucket(IMAGE_BUCKET);

  if (bucket?.public) return;
  if (bucket && !bucket.public) {
    throw imageStorageError('Project image storage must be public to use images in published portfolios.', 409);
  }

  if (bucketError && !hasStorageStatus(bucketError, 404)) {
    console.error('Failed to retrieve project image bucket:', bucketError);
    throw imageStorageError('Could not prepare project image storage.');
  }

  const { error: createError } = await supabase.storage.createBucket(IMAGE_BUCKET, { public: true });
  if (createError && !hasStorageStatus(createError, 409)) {
    console.error('Failed to create project image bucket:', createError);
    throw imageStorageError('Could not prepare project image storage.');
  }

  const { data: configuredBucket, error: verifyError } = await supabase.storage.getBucket(IMAGE_BUCKET);
  if (verifyError || !configuredBucket?.public) {
    if (verifyError) console.error('Failed to validate project image bucket:', verifyError);
    throw imageStorageError('Project image storage must be public to use images in published portfolios.', 409);
  }
}

function parseProjectImage(req, res, next) {
  imageUpload.single('image')(req, res, (err) => {
    if (err) {
      err.status = 400;
      if (err.code === 'LIMIT_FILE_SIZE') {
        err.code = 'image_too_large';
        err.message = 'Image must be smaller than 5 MB.';
      } else {
        err.code = 'invalid_image';
      }
    }
    next(err);
  });
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function generateSlug(resume) {
  const base = slugify(resume.name || resume.title || 'portfolio');
  const random = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${random}` : random;
}

function publishStorageError(dbError) {
  if (dbError.code === '42P01' || dbError.code === 'PGRST205') {
    return {
      code: 'portfolio_storage_not_initialized',
      message: 'Portfolio storage is not configured. Run supabase/schema.sql in the Supabase SQL Editor and retry.'
    };
  }

  if (dbError.code === '42703' || dbError.code === 'PGRST204') {
    return {
      code: 'portfolio_storage_outdated',
      message: 'Portfolio storage is out of date. Run supabase/schema.sql in the Supabase SQL Editor and retry.'
    };
  }

  return {
    code: 'db_error',
    message: 'Could not save the portfolio record. The deployment cleanup was attempted.'
  };
}

router.post('/image', requireAuth, parseProjectImage, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { code: 'missing_image', message: 'No image file received.' } });
    }

    await ensureImageBucket();
    const extension = req.file.mimetype === 'image/png' ? 'png' : 'jpg';
    const path = `${req.user.id}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, req.file.buffer, {
        cacheControl: '31536000',
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Failed to upload project image:', uploadError);
      throw imageStorageError('Could not upload the project image.');
    }

    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw imageStorageError('Could not create a public URL for the project image.');

    res.status(201).json({ url: data.publicUrl });
  } catch (err) {
    next(err.code ? err : imageStorageError('Could not upload the project image.'));
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { resume, layout, preset } = req.body || {};

    if (!resume || typeof resume !== 'object') {
      return res.status(400).json({ error: { code: 'missing_resume', message: 'Resume data is required.' } });
    }

    const { data, warnings } = coerceResume(resume);
    const safeLayout = getLayout(layout).id;
    const html = renderPortfolio(data, safeLayout, preset, { mode: 'published' });
    const deployed = await deploy(html, safeLayout);

    let slug;
    let dbError;

    for (let attempt = 0; attempt < 3; attempt++) {
      slug = generateSlug(data);
      const { error } = await supabase
        .from('portfolios')
        .insert({
          user_id: req.user.id,
          slug,
          resume: data,
          layout: safeLayout,
          preset,
          published_url: deployed.url,
          deploy_provider: deployed.provider,
          deploy_project_id: deployed.projectId || null,
          deploy_project_name: deployed.projectName || null,
          deployment_id: deployed.deploymentId || null,
        });

      if (!error) {
        dbError = null;
        break;
      }

      dbError = error;
      if (error.code !== '23505') break;
    }

    if (dbError) {
      console.error('Failed to save portfolio record:', {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint
      });
      try {
        await destroyDeployment(deployed);
      } catch (cleanupError) {
        console.error('Failed to clean up unpublished deployment:', cleanupError);
      }
      return res.status(500).json({ error: publishStorageError(dbError) });
    }

    res.json({
      url: deployed.url,
      slug,
      provider: deployed.provider,
      deploymentId: deployed.deploymentId,
      note: deployed.note,
      warnings: warnings.length ? warnings : undefined
    });
  } catch (err) {
    next(err);
  }
});

export default router;
