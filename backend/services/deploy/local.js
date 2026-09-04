import { writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { copyTemplateAssets } from './template-assets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLISHED_DIR = path.join(__dirname, '..', '..', 'published');

function localDeploymentDir(deploymentId) {
  const dir = path.resolve(PUBLISHED_DIR, deploymentId);
  const root = `${path.resolve(PUBLISHED_DIR)}${path.sep}`;

  if (!deploymentId || !dir.startsWith(root)) {
    const error = new Error('Invalid local deployment id.');
    error.code = 'invalid_deployment_id';
    error.status = 400;
    throw error;
  }

  return dir;
}

export async function deployLocal(html, layoutId) {
  const id = crypto.randomUUID();
  const dir = localDeploymentDir(id);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html, 'utf-8');
  await copyTemplateAssets(layoutId, dir);

  const publicBase = process.env.PUBLIC_BASE_URL || 'http://localhost:3003';
  return {
    url: `${publicBase}/p/${id}`,
    provider: 'local',
    deploymentId: id,
    note: 'Local development URL — only reachable from this machine.'
  };
}

export async function deleteLocal(deploymentId) {
  await rm(localDeploymentDir(deploymentId), { recursive: true, force: true });
}
