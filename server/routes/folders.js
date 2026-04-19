const express = require('express');
const Folder = require('../models/Folder');
const Image = require('../models/Image');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/folders?parent=
// List folders at a given level. If no parent, list root folders.
router.get('/', async (req, res) => {
  try {
    const { parent } = req.query;
    const query = {
      user: req.user._id,
      parent: parent || null,
    };

    const folders = await Folder.find(query).sort({ createdAt: -1 });

    // Calculate size for each folder
    const foldersWithSize = await Promise.all(
      folders.map(async (folder) => {
        const size = await calculateFolderSize(folder._id, req.user._id);
        return { ...folder.toObject(), size };
      })
    );

    res.json(foldersWithSize);
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ message: 'Error fetching folders' });
  }
});

// GET /api/folders/:id
// Get a single folder
router.get('/:id', async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const size = await calculateFolderSize(folder._id, req.user._id);
    res.json({ ...folder.toObject(), size });
  } catch (error) {
    console.error('Get folder error:', error);
    res.status(500).json({ message: 'Error fetching folder' });
  }
});

// GET /api/folders/:id/path
// Get the full path (breadcrumb) for a folder
router.get('/:id/path', async (req, res) => {
  try {
    const breadcrumb = [];
    let currentId = req.params.id;

    while (currentId) {
      const folder = await Folder.findOne({
        _id: currentId,
        user: req.user._id,
      });

      if (!folder) break;

      breadcrumb.unshift({ _id: folder._id, name: folder.name });
      currentId = folder.parent;
    }

    res.json(breadcrumb);
  } catch (error) {
    console.error('Get path error:', error);
    res.status(500).json({ message: 'Error fetching folder path' });
  }
});

// POST /api/folders
// Create a new folder
router.post('/', async (req, res) => {
  try {
    const { name, parent } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    // If parent is specified, verify it exists and belongs to user
    if (parent) {
      const parentFolder = await Folder.findOne({
        _id: parent,
        user: req.user._id,
      });

      if (!parentFolder) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
    }

    // Check for duplicate name in same parent
    const existing = await Folder.findOne({
      name: name.trim(),
      parent: parent || null,
      user: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ message: 'A folder with this name already exists here' });
    }

    const folder = await Folder.create({
      name: name.trim(),
      parent: parent || null,
      user: req.user._id,
    });

    res.status(201).json({ ...folder.toObject(), size: 0 });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ message: 'Error creating folder' });
  }
});

// DELETE /api/folders/:id
// Delete a folder and all its contents recursively
router.delete('/:id', async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    await deleteFolderRecursive(folder._id, req.user._id);

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ message: 'Error deleting folder' });
  }
});

// Recursive function to calculate folder size
async function calculateFolderSize(folderId, userId) {
  // Sum of all images in this folder
  const images = await Image.find({ folder: folderId, user: userId });
  let totalSize = images.reduce((sum, img) => sum + img.size, 0);

  // Sum of all child folders
  const childFolders = await Folder.find({ parent: folderId, user: userId });
  for (const child of childFolders) {
    totalSize += await calculateFolderSize(child._id, userId);
  }

  return totalSize;
}

// Recursive function to delete folder and all contents
async function deleteFolderRecursive(folderId, userId) {
  const cloudinary = require('cloudinary').v2;
  const images = await Image.find({ folder: folderId, user: userId });
  for (const image of images) {
    await cloudinary.uploader.destroy(image.filename).catch(() => {});
  }
  await Image.deleteMany({ folder: folderId, user: userId });
  const childFolders = await Folder.find({ parent: folderId, user: userId });
  for (const child of childFolders) {
    await deleteFolderRecursive(child._id, userId);
  }
  await Folder.findByIdAndDelete(folderId);
}

module.exports = router;
