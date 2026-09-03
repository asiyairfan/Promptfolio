import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLISHED_DIR = path.join(__dirname, '..', '..', 'published');

export async function deployLocal(html, meta = {}) {
  const id = crypto.randomUUID();
  const dir = path.join(PUBLISHED_DIR, id);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html, 'utf-8');

  const publicBase = process.env.PUBLIC_BASE_URL || 'http://localhost:3001';
  return {
    url: `${publicBase}/p/${id}`,
    provider: 'local',
    deploymentId: id,
    note: meta.note || 'Local fallback URL — only reachable from this machine.'
  };
}
