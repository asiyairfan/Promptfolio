import { Router } from 'express';
import { coerceResume } from '../../shared/resume-schema.js';
import { renderPortfolio } from '../../shared/render.js';
import { getLayout } from '../../shared/style-presets.js';
import { deploy, destroyDeployment } from '../services/deploy/index.js';
import { requireAuth } from '../lib/auth.js';
import { supabase } from '../lib/supabase.js';

const router = Router();

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
