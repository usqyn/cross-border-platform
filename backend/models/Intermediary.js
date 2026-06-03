const mongoose = require('mongoose');

const intermediarySchema = new mongoose.Schema({
  name: {
    type: Map,
    of: String,
    required: true
  },
  logo: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['visa_legal', 'customs_auto', 'real_estate', 'study_life', 'vehicle_service', 'personal_service', 'business_service', 'logistics'],
    required: true
  },
  businessZone: {
    type: String,
    enum: ['visa_legal', 'customs_auto', 'real_estate', 'study_life'],
    default: null
  },
  isCertified: {
    type: Boolean,
    default: false
  },
  membershipLevel: {
    type: String,
    enum: ['basic', 'premium', 'vip'],
    default: 'basic'
  },
  vipLevel: {
    type: String,
    enum: ['normal', 'vip'],
    default: 'normal'
  },
  coins: {
    type: Number,
    default: 0
  },
  free_unlock_quota: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  credit_score: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  weight_score: {
    type: Number,
    default: 0
  },
  has_full_responsibility_dispute: {
    type: Boolean,
    default: false
  },
  dispute_warning_expires_at: {
    type: Date,
    default: null
  },
  tags: {
    type: [String],
    default: []
  },
  description: {
    type: Map,
    of: String,
    default: {}
  },
  contact: {
    phone: { type: String, default: '' },
    wechat: { type: String, default: '' },
    address: { type: Map, of: String, default: {} }
  },
  credentials: {
    type: [String],
    default: []
  },
  cases: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Intermediary', intermediarySchema);
