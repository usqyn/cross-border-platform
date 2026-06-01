const Lead = require('../models/Lead');
const { translateToAllLanguages } = require('../utils/translator');

exports.sendMessage = async (req, res) => {
  try {
    const { lead_id, user_id, user_type, content, language = 'zh', images = [] } = req.body;

    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Auto-translate the content
    const translations = translateToAllLanguages(content, language);

    const message = {
      user_id,
      user_type,
      original_content: content,
      original_language: language,
      translated_content: translations,
      images,
      created_at: new Date()
    };

    lead.messages.push(message);
    lead.updated_at = new Date();
    await lead.save();

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { lead_id } = req.params;

    const lead = await Lead.findById(lead_id)
      .populate('messages.user_id', 'nickname avatar');

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ success: true, data: lead.messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
