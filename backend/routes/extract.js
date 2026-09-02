import { Router } from 'express';
import multer from 'multer';
import { extractTextFromPdf } from '../services/pdf.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'), false);
    }
  }
});

const router = Router();

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { code: 'no_file', message: 'No PDF file received.' } });
    }

    const result = await extractTextFromPdf(req.file.buffer);
    if (!result.ok) {
      return res.status(422).json({ error: { code: result.error, message: result.message } });
    }

    res.json({ text: result.text, chars: result.chars });
  } catch (err) {
    next(err);
  }
});

export default router;
