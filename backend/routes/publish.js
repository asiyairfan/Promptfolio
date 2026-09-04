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

    const slug = generateSlug(data);
    const { error: dbError } = await supabase
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

    if (dbError) {
      console.error('Failed to save portfolio record:', dbError);
      try {
        await destroyDeployment(deployed);
      } catch (cleanupError) {
        console.error('Failed to clean up unpublished deployment:', cleanupError);
      }
      return res.status(500).json({ error: { code: 'db_error', message: 'Could not save the portfolio record. The deployment cleanup was attempted.' } });
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
