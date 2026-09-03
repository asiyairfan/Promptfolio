import { Router } from 'express';
import { requireAuth } from '../lib/auth.js';
import { supabase } from '../lib/supabase.js';
import { destroyDeployment } from '../services/deploy/index.js';

const router = Router();
const LOCAL_DEPLOYMENT_PATH = /^\/p\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i;

function legacyLocalDeploymentId(publishedUrl) {
  try {
    return new URL(publishedUrl).pathname.match(LOCAL_DEPLOYMENT_PATH)?.[1] || null;
  } catch {
    return null;
  }
}

function deploymentFor(portfolio) {
  if (portfolio.deploy_provider) {
    return {
      provider: portfolio.deploy_provider,
      projectId: portfolio.deploy_project_id,
      projectName: portfolio.deploy_project_name,
      deploymentId: portfolio.deployment_id
    };
  }

  const deploymentId = legacyLocalDeploymentId(portfolio.published_url);
  return deploymentId ? { provider: 'local', deploymentId } : null;
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('id, slug, layout, preset, published_url, created_at, updated_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ portfolios: data || [] });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('slug', req.params.slug)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: { code: 'not_found', message: 'Portfolio not found.' } });
    }
    res.json({ portfolio: data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:slug', requireAuth, async (req, res, next) => {
  try {
    const { data: portfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('slug, published_url, deploy_provider, deploy_project_id, deploy_project_name, deployment_id')
      .eq('user_id', req.user.id)
      .eq('slug', req.params.slug)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!portfolio) {
      return res.status(404).json({ error: { code: 'not_found', message: 'Portfolio not found.' } });
    }

    const deployment = deploymentFor(portfolio);
    if (!deployment) {
      return res.status(409).json({
        error: {
          code: 'deployment_metadata_missing',
          message: 'This legacy Vercel portfolio cannot be removed automatically because deployment metadata was not saved. Its account record was kept so you can remove the hosted project manually.'
        }
      });
    }

    try {
      await destroyDeployment(deployment);
    } catch (err) {
      const status = err.status === 409 ? 409 : 502;
      return res.status(status).json({
        error: {
          code: err.code || 'deployment_delete_failed',
          message: status === 409
            ? err.message
            : `Could not remove the hosted portfolio. Your account record was kept so you can retry. ${err.message}`
        }
      });
    }

    const { error: deleteError } = await supabase
      .from('portfolios')
      .delete()
      .eq('user_id', req.user.id)
      .eq('slug', req.params.slug);

    if (deleteError) throw deleteError;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
