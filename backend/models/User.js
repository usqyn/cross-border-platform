const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    unique: true
  },
  nickname: {
    type: String,
    default: '匿名用户'
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    enum: ['zh', 'ru', 'kk'],
    default: 'zh'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
