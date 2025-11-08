const express = require('express');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

const router = express.Router();

// Get medicine history (taken doses)
router.get('/', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.userId })
      .select('name dosage times createdAt')
      .sort({ createdAt: -1 });

    const history = medicines.map(medicine => ({
      id: medicine._id,
      name: medicine.name,
      dosage: medicine.dosage,
      takenDoses: medicine.times.filter(time => time.taken).length,
      totalDoses: medicine.times.length,
      lastTaken: medicine.times
        .filter(time => time.taken)
        .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))[0]?.takenAt,
      createdAt: medicine.createdAt
    }));

    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed history for a specific medicine
router.get('/:medicineId', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.medicineId, userId: req.userId });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const detailedHistory = medicine.times
      .filter(time => time.taken)
      .map(time => ({
        time: time.time,
        takenAt: time.takenAt
      }))
      .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt));

    res.json({
      medicine: {
        id: medicine._id,
        name: medicine.name,
        dosage: medicine.dosage
      },
      history: detailedHistory
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
