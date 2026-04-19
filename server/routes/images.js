const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const Image = require('../models/Image');
const Folder = require('../models/Folder');
const auth = require('../middleware/auth');

const router = express.Router();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = cloudinaryStorage({
  cloudinary,
  folder: 'filedrive',
  allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
});

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
    if (!name?.trim()) {
      if (req.file?.public_id) await cloudinary.v2.uploader.destroy(req.file.public_id);
      return res.status(400).json({ message: 'Image name is required' });
    }
    if (!folderId) {
      if (req.file?.public_id) await cloudinary.v2.uploader.destroy(req.file.public_id);
      return res.status(400).json({ message: 'Folder ID is required' });
    }
    if (!req.file) return res.status(400).json({ message: 'Image file is required' });

    const folder = await Folder.findOne({ _id: folderId, user: req.user._id });
    if (!folder) {
      await cloudinary.v2.uploader.destroy(req.file.public_id);
      return res.status(404).json({ message: 'Folder not found' });
    }

    const image = await Image.create({
      name: name.trim(),
      filename: req.file.public_id,
      path: req.file.secure_url || req.file.url || req.file.path,
      size: req.file.size || req.file.bytes || 0,
      mimetype: req.file.mimetype || req.file.format ? `image/${req.file.format}` : 'image/jpeg',
      folder: folderId,
      user: req.user._id,
    });
    res.status(201).json(image);
  } catch (err) {
    if (req.file?.public_id) await cloudinary.v2.uploader.destroy(req.file.public_id).catch(() => {});
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const image = await Image.findOne({ _id: req.params.id, user: req.user._id });
    if (!image) return res.status(404).json({ message: 'Image not found' });
    await cloudinary.v2.uploader.destroy(image.filename).catch(() => {});
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