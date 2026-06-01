const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Durable storage is enabled by setting CLOUDINARY_URL
// (format: cloudinary://<api_key>:<api_secret>@<cloud_name>).
// When it's absent, files are saved to the local ./uploads folder instead,
// which is perfect for local development.
const usingCloudinary = !!process.env.CLOUDINARY_URL;

let cloudinary;
if (usingCloudinary) {
  cloudinary = require('cloudinary').v2; // auto-configures from CLOUDINARY_URL
}

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'social-scoop' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });

const saveLocally = (file, req) => {
  const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}-${safe}`;
  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
  const base = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${filename}`;
};

// Persists an uploaded file and returns a public URL to it.
const saveFile = async (file, req) => {
  if (usingCloudinary) return uploadToCloudinary(file.buffer);
  return saveLocally(file, req);
};

module.exports = { saveFile, usingCloudinary };
