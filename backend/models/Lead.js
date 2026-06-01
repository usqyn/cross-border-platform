const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  intermediary_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intermediary',
    default: null
  },
  service_type: {
    type: String,
    enum: ['vehicle', 'personal', 'business', 'logistics'],
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  requirements_translations: {
    type: Map,
    of: String,
    default: {}
  },
  messages: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user_type: { type: String, enum: ['buyer', 'seller'], required: true },
    original_content: { type: String, required: true },
    original_language: { type: String, enum: ['zh', 'ru', 'kk'], default: 'zh' },
    translated_content: { type: Map, of: String, default: {} },
    images: { type: [String], default: [] },
    created_at: { type: Date, default: Date.now }
  }],
  departure_time: {
    type: Date,
    required: true
  },
  contact_phone: {
    type: String,
    required: true
  },
  contact_wechat: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: [
      'pending_unlock',
      'unlocked',
      'completed',
      'dispute',
      'funds_escrowed',
      'refund_requested',
      'partial_refund_proposed',
      'dispute_reviewing',
      'arbitrated_completed'
    ],
    default: 'pending_unlock'
  },
  escrow_amount: {
    type: Number,
    default: 0
  },
  refund_request: {
    requested_amount: { type: Number, default: 0 },
    reason: { type: String, default: '' },
    evidences: { type: [String], default: [] },
    requested_at: { type: Date, default: null }
  },
  partial_refund_proposal: {
    proposed_amount: { type: Number, default: 0 },
    deduction_reason: { type: String, default: '' },
    proposed_at: { type: Date, default: null }
  },
  dispute_logs: [{
    user_type: { type: String, enum: ['buyer', 'seller'], required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, default: '' },
    images: { type: [String], default: [] },
    submitted_at: { type: Date, default: Date.now }
  }],
  dispute_deadline: {
    type: Date,
    default: null
  },
  arbitration: {
    refund_to_buyer: { type: Number, default: 0 },
    pay_to_seller: { type: Number, default: 0 },
    judgment_reason: { type: String, default: '' },
    arbitrated_by: { type: String, default: '' },
    arbitrated_at: { type: Date, default: null }
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

module.exports = mongoose.model('Lead', leadSchema);
