const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  subscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    }
  }
});

module.exports = mongoose.model('User', userSchema);
