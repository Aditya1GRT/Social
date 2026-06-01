const express = require('express');
const router = express.Router();
const multer = require('multer');
const { saveFile } = require('../services/storage');

// Keep the file in memory so it can be sent to either local disk or Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// POST /api/upload — accepts a single file under the field name "file".
// Public on purpose: profile pictures are uploaded during signup, before a
// user has an auth token. Returns a URL the frontend can store and render.
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const url = await saveFile(req.file, req);
    res.status(201).json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
