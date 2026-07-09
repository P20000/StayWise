const multer = require('multer');

// Rule #9: Strictly use memoryStorage to ensure stateless cloud container compliance.
// Files are held in memory buffers (`req.file.buffer`) and streamed directly to Cloudinary.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('[UPLOAD_ERROR] Only image mimes (JPEG/PNG/WEBP) are permitted.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB ceiling per image
  },
});

module.exports = upload;
