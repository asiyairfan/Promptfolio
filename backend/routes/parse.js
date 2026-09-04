import { Router } from 'express';
import { parseResume } from '../services/ai.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { text, jobDescription, suggestStyle } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: { code: 'missing_text', message: 'Resume text is required.' } });
    }

    const result = await parseResume({
      text,
      jobDescription,
      suggestStyle: Boolean(suggestStyle)
    });

    res.json({
      resume: result.resume,
      score: result.score,
      styleSuggestion: result.styleSuggestion,
      warnings: result.warnings,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
});

export default router;
