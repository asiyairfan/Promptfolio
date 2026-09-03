import { Router } from 'express';
import { requireAuth } from '../lib/auth.js';
import { supabase } from '../lib/supabase.js';

const router = Router();

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
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('user_id', req.user.id)
      .eq('slug', req.params.slug);

    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
