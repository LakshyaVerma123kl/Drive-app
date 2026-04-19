const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Image = require('../models/Image');
const Folder = require('../models/Folder');
const auth = require('../middleware/auth');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { folder } = req.query;
    if (!folder) return res.status(400).json({ message: 'Folder ID is required' });
    const folderDoc = await Folder.findOne({ _id: folder, user: req.user._id });
    if (!folderDoc) return res.status(404).json({ message: 'Folder not found' });
    const images = await Image.find({ folder, user: req.user._id }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching images' });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, folderId } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Image name is required' });
    if (!folderId) return res.status(400).json({ message: 'Folder ID is required' });
    if (!req.file) return res.status(400).json({ message: 'Image file is required' });

    const folder = await Folder.findOne({ _id: folderId, user: req.user._id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // Upload to Cloudinary via stream
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'filedrive' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    const image = await Image.create({
      name: name.trim(),
      filename: cloudinaryResult.public_id,
      path: cloudinaryResult.secure_url,
      size: cloudinaryResult.bytes || req.file.size,
      mimetype: req.file.mimetype,
      folder: folderId,
      user: req.user._id,
    });
    res.status(201).json(image);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const image = await Image.findOne({ _id: req.params.id, user: req.user._id });
    if (!image) return res.status(404).json({ message: 'Image not found' });
    await cloudinary.uploader.destroy(image.filename).catch(() => {});
    await Image.findByIdAndDelete(image._id);
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting image' });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File size cannot exceed 10MB' });
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

module.exports = router;