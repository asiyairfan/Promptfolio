import { cp, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getOriginalTemplateLayout } from '../../../shared/template-layouts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates');

function templateSource(layoutId) {
  const template = getOriginalTemplateLayout(layoutId);
  return template ? path.join(TEMPLATES_DIR, template.assetDirectory) : null;
}

export async function copyTemplateAssets(layoutId, destination) {
  const source = templateSource(layoutId);
  if (!source) return;
  await cp(source, destination, { recursive: true, force: true });
}

async function listFiles(directory, relativePath = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.DS_Store') continue;

    const nextRelativePath = path.posix.join(relativePath, entry.name);
    const nextPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(nextPath, nextRelativePath));
    } else if (entry.isFile()) {
      files.push({ path: nextPath, relativePath: nextRelativePath });
    }
  }

  return files;
}

export async function vercelTemplateFiles(layoutId) {
  const source = templateSource(layoutId);
  if (!source) return [];

  const files = await listFiles(source);
  return Promise.all(files.map(async ({ path: filePath, relativePath }) => ({
    file: relativePath,
    data: (await readFile(filePath)).toString('base64'),
    encoding: 'base64'
  })));
}
