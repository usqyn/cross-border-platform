const Lead = require('../models/Lead');
const IntermediaryWallet = require('../models/IntermediaryWallet');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Intermediary = require('../models/Intermediary');

exports.createLead = async (req, res) => {
  try {
    const { user_id, intermediary_id, service_type, requirements, departure_time, contact_phone, contact_wechat } = req.body;
    
    const lead = new Lead({
      user_id,
      intermediary_id,
      service_type,
      requirements,
      departure_time,
      contact_phone,
      contact_wechat
    });
    
    await lead.save();
    
    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.unlockLead = async (req, res) => {
  try {
    const { lead_id, intermediary_id } = req.body;
    
    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ success: false, error: '线索不存在' });
    }
    
    if (lead.status !== 'pending_unlock') {
      return res.status(400).json({ success: false, error: '线索已被解锁' });
    }
    
    const intermediary = await Intermediary.findById(intermediary_id);
    if (!intermediary) {
      return res.status(404).json({ success: false, error: '中介不存在' });
    }
    
    const user = await User.findById(lead.user_id);
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    
    const UNLOCK_COST = 20;
    let coinsDeducted = UNLOCK_COST;
    let usedFreeQuota = false;
    
    if (intermediary.vipLevel === 'vip') {
      if (intermediary.free_unlock_quota > 0) {
        intermediary.free_unlock_quota -= 1;
        coinsDeducted = 0;
        usedFreeQuota = true;
      } else {
        coinsDeducted = Math.floor(UNLOCK_COST * 0.5);
      }
    }
    
    if (!usedFreeQuota) {
      if (intermediary.coins < coinsDeducted) {
        return res.status(400).json({ 
          success: false, 
          error: '您的账户积分不足，请联系平台客服微信充值',
          current_coins: intermediary.coins,
          required_coins: coinsDeducted
        });
      }
      intermediary.coins -= coinsDeducted;
    }
    
    await intermediary.save();
    
    lead.intermediary_id = intermediary_id;
    lead.status = 'unlocked';
    lead.updated_at = new Date();
    await lead.save();
    
    res.json({ 
      success: true, 
      data: {
        lead,
        contact: {
          phone: lead.contact_phone,
          wechat: lead.contact_wechat,
          user_name: user.nickname
        },
        transaction: {
          coins_deducted: coinsDeducted,
          remaining_coins: intermediary.coins,
          used_free_quota: usedFreeQuota,
          free_quota_remaining: intermediary.free_unlock_quota
        }
      }
    });
  } catch (error) {
    console.error('Unlock lead error:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
};

exports.getLeadsList = async (req, res) => {
  try {
    const { status, intermediary_id, user_id, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (intermediary_id) query.intermediary_id = intermediary_id;
    if (user_id) query.user_id = user_id;
    
    const leads = await Lead.find(query)
      .populate('user_id', 'nickname')
      .populate('intermediary_id', 'name')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Lead.countDocuments(query);
    
    const maskedLeads = leads.map(lead => {
      const leadObj = lead.toObject();
      if (leadObj.status === 'pending_unlock') {
        leadObj.contact_phone = leadObj.contact_phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
        delete leadObj.contact_wechat;
      }
      return leadObj;
    });
    
    res.json({ success: true, data: maskedLeads, pagination: { page, limit, total } });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.getLeadDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { intermediary_id } = req.query;
    
    const lead = await Lead.findById(id)
      .populate('user_id', 'nickname avatar')
      .populate('intermediary_id', 'name');
    
    if (!lead) {
      return res.status(404).json({ error: '线索不存在' });
    }
    
    const leadObj = lead.toObject();
    
    if (leadObj.status === 'pending_unlock') {
      leadObj.contact_phone = leadObj.contact_phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      delete leadObj.contact_wechat;
    }
    
    res.json({ success: true, data: leadObj });
  } catch (error) {
    console.error('Get lead detail error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.createEscrowOrder = async (req, res) => {
  try {
    const { lead_id, intermediary_id, amount } = req.body;
    
    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ error: '线索不存在' });
    }
    
    if (lead.status !== 'unlocked') {
      return res.status(400).json({ error: '线索状态不正确' });
    }
    
    const platform_fee = Math.round(amount * 0.10 * 100) / 100;
    
    const payment = new Payment({
      lead_id,
      user_id: lead.user_id,
      intermediary_id,
      amount,
      platform_fee,
      status: 'pending'
    });
    
    await payment.save();
    
    lead.escrow_amount = amount;
    lead.status = 'funds_escrowed';
    lead.updated_at = new Date();
    await lead.save();
    
    res.json({ success: true, data: { lead, payment } });
  } catch (error) {
    console.error('Create escrow error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.payEscrow = async (req, res) => {
  try {
    const { payment_id, transaction_id } = req.body;
    
    const payment = await Payment.findById(payment_id);
    if (!payment) {
      return res.status(404).json({ error: '支付记录不存在' });
    }
    
    payment.status = 'paid';
    payment.transaction_id = transaction_id;
    payment.paid_at = new Date();
    await payment.save();
    
    const lead = await Lead.findById(payment.lead_id);
    const wallet = await IntermediaryWallet.findOne({ intermediary_id: payment.intermediary_id });
    
    wallet.frozen_balance += payment.amount - payment.platform_fee;
    wallet.updated_at = new Date();
    await wallet.save();
    
    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Pay escrow error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.completeService = async (req, res) => {
  try {
    const { payment_id, proof_images } = req.body;
    
    const payment = await Payment.findById(payment_id);
    if (!payment) {
      return res.status(404).json({ error: '支付记录不存在' });
    }
    
    if (payment.status !== 'paid') {
      return res.status(400).json({ error: '支付状态不正确' });
    }
    
    payment.proof_images = proof_images;
    await payment.save();
    
    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Complete service error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.confirmCompletion = async (req, res) => {
  try {
    const { payment_id } = req.body;
    
    const payment = await Payment.findById(payment_id);
    if (!payment) {
      return res.status(404).json({ error: '支付记录不存在' });
    }
    
    if (payment.status !== 'paid') {
      return res.status(400).json({ error: '支付状态不正确' });
    }
    
    payment.status = 'settled';
    payment.settled_at = new Date();
    await payment.save();
    
    const lead = await Lead.findById(payment.lead_id);
    lead.status = 'completed';
    lead.updated_at = new Date();
    await lead.save();
    
    const wallet = await IntermediaryWallet.findOne({ intermediary_id: payment.intermediary_id });
    const settle_amount = payment.amount - payment.platform_fee;
    
    wallet.frozen_balance -= settle_amount;
    wallet.available_balance += settle_amount;
    wallet.total_earned += settle_amount;
    wallet.updated_at = new Date();
    await wallet.save();
    
    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Confirm completion error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
