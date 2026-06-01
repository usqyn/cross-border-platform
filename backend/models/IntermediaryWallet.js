const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  intermediary_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intermediary',
    required: true,
    unique: true
  },
  points_balance: {
    type: Number,
    default: 100,
    min: 0
  },
  membership_level: {
    type: String,
    enum: ['free', 'vip', 'svip'],
    default: 'free'
  },
  frozen_balance: {
    type: Number,
    default: 0,
    min: 0
  },
  available_balance: {
    type: Number,
    default: 0,
    min: 0
  },
  total_earned: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('IntermediaryWallet', walletSchema);
