const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Prescription = require('../models/Prescription');
const auth = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all prescriptions for user
router.get('/', auth, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.userId })
      .sort({ uploadedAt: -1 });
    res.json({ prescriptions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload prescription
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { title, description } = req.body;

    const prescription = new Prescription({
      userId: req.userId,
      title: title || 'Untitled Prescription',
      description,
      imageUrl: `/uploads/${req.file.filename}`,
      imagePath: req.file.path
    });

    await prescription.save();
    res.status(201).json({ prescription });
  } catch (error) {
    // Clean up uploaded file if database save fails
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get prescription by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, userId: req.userId });
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    res.json({ prescription });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete prescription
router.delete('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, userId: req.userId });
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(prescription.imagePath)) {
      fs.unlinkSync(prescription.imagePath);
    }

    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
