const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

router.get('/list', async (req, res) => {
  try {
    const { intermediary_id, user_id } = req.query;
    const query = {};
    if (intermediary_id) query.intermediary_id = intermediary_id;
    if (user_id) query.user_id = user_id;
    
    const payments = await Payment.find(query)
      .populate('user_id', 'nickname avatar')
      .populate('intermediary_id', 'name')
      .populate('lead_id', 'service_type requirements')
      .sort({ created_at: -1 });
    
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
