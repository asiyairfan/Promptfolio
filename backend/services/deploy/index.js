import { deployToVercel } from './vercel.js';
import { deployLocal } from './local.js';

export function deployProvider() {
  return process.env.VERCEL_TOKEN ? 'vercel' : 'local';
}

export async function deploy(html) {
  if (process.env.VERCEL_TOKEN) {
    try {
      return await deployToVercel(html);
    } catch (err) {
      console.warn('Vercel deploy failed, falling back to local:', err.message);
      return deployLocal(html, { note: `Vercel fallback: ${err.message}` });
    }
  }
  return deployLocal(html);
}
