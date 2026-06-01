const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
  title: {
    type: Map,
    of: String,
    required: true
  },
  content: {
    type: Map,
    of: String,
    required: true
  },
  category: {
    type: String,
    enum: ['vehicle', 'personal', 'business', 'logistics', 'general'],
    default: 'general'
  },
  keywords: {
    type: [String],
    default: []
  },
  source: {
    type: String,
    default: ''
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
