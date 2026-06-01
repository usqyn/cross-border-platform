const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  intermediaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intermediary',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: Map,
    of: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    default: null
  },
  order_type: {
    type: String,
    enum: ['escrow', 'unlock_only'],
    default: 'unlock_only'
  },
  review_weight: {
    type: Number,
    default: 1.0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', reviewSchema);
