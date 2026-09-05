import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Adjust this path if your images live somewhere else inside templates/mark
const TARGET_DIR = path.join(__dirname, '..', 'templates');
const MAX_WIDTH = 1600;
const QUALITY = 75;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function compressFile(filePath) {
  const before = (await stat(filePath)).size;
  const buffer = await sharp(filePath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer()
    .catch(async () => {
      // PNG fallback if jpeg() fails on a png input
      return sharp(filePath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .png({ quality: QUALITY, compressionLevel: 9 })
        .toBuffer();
    });

  await sharp(buffer).toFile(filePath + '.tmp');
  const { rename } = await import('node:fs/promises');
  await rename(filePath + '.tmp', filePath);

  const after = (await stat(filePath)).size;
  console.log(`${path.basename(filePath)}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`);
}

async function main() {
  const files = await walk(TARGET_DIR);
  console.log(`Found ${files.length} images. Compressing...`);
  for (const file of files) {
    try {
      await compressFile(file);
    } catch (err) {
      console.error(`Failed on ${file}:`, err.message);
    }
  }
  console.log('Done.');
}

main();