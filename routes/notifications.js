const express = require('express');
const webpush = require('web-push');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure web-push
// Temporarily disabled due to VAPID key validation issue
// if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
//   webpush.setVapidDetails(
//     'mailto:' + process.env.EMAIL,
//     process.env.VAPID_PUBLIC_KEY,
//     process.env.VAPID_PRIVATE_KEY
//   );
// }

// Subscribe to push notifications
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;

    await User.findByIdAndUpdate(req.userId, { subscription });

    res.json({ message: 'Subscription saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send test notification
router.post('/test', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.subscription) {
      return res.status(400).json({ message: 'No subscription found' });
    }

    const payload = JSON.stringify({
      title: 'CareConnect Test',
      body: 'This is a test notification from CareConnect',
      icon: '/icon-192x192.png'
    });

    await webpush.sendNotification(user.subscription, payload);
    res.json({ message: 'Test notification sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send notification' });
  }
});

// Schedule medicine reminder (this would be called by a cron job or scheduler)
router.post('/remind/:medicineId', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.medicineId, userId: req.userId });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const user = await User.findById(req.userId);
    if (!user.subscription) {
      return res.status(400).json({ message: 'No subscription found' });
    }

    const payload = JSON.stringify({
      title: 'Medicine Reminder',
      body: `Time to take ${medicine.name} (${medicine.dosage})`,
      icon: '/icon-192x192.png',
      data: {
        medicineId: medicine._id,
        type: 'medicine_reminder'
      }
    });

    await webpush.sendNotification(user.subscription, payload);
    res.json({ message: 'Reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send reminder' });
  }
});

// Get notification settings/status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('subscription');
    res.json({
      hasSubscription: !!user.subscription,
      subscription: user.subscription ? { endpoint: user.subscription.endpoint } : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
