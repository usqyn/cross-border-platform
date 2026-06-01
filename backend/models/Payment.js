const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  intermediary_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intermediary',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  platform_fee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: [
      'pending',
      'paid',
      'refunded',
      'settled',
      'refund_requested',
      'partial_refund_proposed',
      'dispute_reviewing',
      'arbitrated_completed'
    ],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['wechat', 'alipay'],
    default: 'wechat'
  },
  transaction_id: {
    type: String,
    default: ''
  },
  proof_images: {
    type: [String],
    default: []
  },
  refund_amount: {
    type: Number,
    default: 0
  },
  settled_amount: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  paid_at: {
    type: Date,
    default: null
  },
  settled_at: {
    type: Date,
    default: null
  },
  refunded_at: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
