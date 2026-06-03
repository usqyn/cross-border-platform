const mongoose = require('mongoose');

const borderStatusSchema = new mongoose.Schema({
  border_name: {
    type: String,
    enum: ['霍尔果斯', '阿拉山口', '巴克图', '吉木乃'],
    required: true
  },
  status: {
    type: String,
    enum: ['正常通关', '排队中', '临时关闭', '节假日休息'],
    default: '正常通关'
  },
  estimated_wait_time: {
    type: String,
    default: '无排队'
  },
  announcement: {
    type: Map,
    of: String,
    default: {}
  },
  is_active: {
    type: Boolean,
    default: true
  },
  display_order: {
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

module.exports = mongoose.model('BorderStatus', borderStatusSchema);
