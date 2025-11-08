const express = require('express');
const { body, validationResult } = require('express-validator');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all medicines for user
router.get('/', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.userId, active: true })
      .sort({ createdAt: -1 });
    res.json({ medicines });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new medicine
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1 }),
  body('dosage').trim().isLength({ min: 1 }),
  body('frequency').isIn(['daily', 'weekly', 'monthly']),
  body('times').isArray({ min: 1 }),
  body('startDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, dosage, frequency, times, startDate, endDate, notes } = req.body;

    const medicine = new Medicine({
      userId: req.userId,
      name,
      dosage,
      frequency,
      times,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      notes
    });

    await medicine.save();
    res.status(201).json({ medicine });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update medicine
router.put('/:id', [
  auth,
  body('name').optional().trim().isLength({ min: 1 }),
  body('dosage').optional().trim().isLength({ min: 1 }),
  body('frequency').optional().isIn(['daily', 'weekly', 'monthly']),
  body('times').optional().isArray(),
  body('startDate').optional().isISO8601(),
  body('active').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const medicine = await Medicine.findOne({ _id: req.params.id, userId: req.userId });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const updates = req.body;
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    Object.assign(medicine, updates);
    await medicine.save();

    res.json({ medicine });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark dose as taken
router.post('/:id/take/:timeIndex', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.id, userId: req.userId });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const timeIndex = parseInt(req.params.timeIndex);
    if (timeIndex < 0 || timeIndex >= medicine.times.length) {
      return res.status(400).json({ message: 'Invalid time index' });
    }

    medicine.times[timeIndex].taken = true;
    medicine.times[timeIndex].takenAt = new Date();
    await medicine.save();

    res.json({ medicine });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete medicine
router.delete('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
