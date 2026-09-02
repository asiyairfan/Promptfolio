import { Router } from 'express';
import { coerceResume } from '../../shared/resume-schema.js';
import { renderPortfolio } from '../../shared/render.js';
import { getLayout } from '../../shared/style-presets.js';
import { deploy } from '../services/deploy/index.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { resume, layout, preset } = req.body || {};

    if (!resume || typeof resume !== 'object') {
      return res.status(400).json({ error: { code: 'missing_resume', message: 'Resume data is required.' } });
    }

    const { data, warnings } = coerceResume(resume);
    const safeLayout = getLayout(layout).id;
    const html = renderPortfolio(data, safeLayout, preset);
    const deployed = await deploy(html);

    res.json({
      url: deployed.url,
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
