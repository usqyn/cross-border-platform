const Lead = require('../models/Lead');
const Payment = require('../models/Payment');
const IntermediaryWallet = require('../models/IntermediaryWallet');

exports.requestRefund = async (req, res) => {
  try {
    const { lead_id, requested_amount, reason, evidences } = req.body;

    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ error: '订单不存在' });
    }

    if (lead.status !== 'funds_escrowed' && lead.status !== 'paid') {
      return res.status(400).json({ error: '当前订单状态不允许申请退款' });
    }

    if (requested_amount > lead.escrow_amount) {
      return res.status(400).json({ error: '申请退款金额不能超过托管金额' });
    }

    lead.status = 'refund_requested';
    lead.refund_request = {
      requested_amount,
      reason,
      evidences: evidences || [],
      requested_at: new Date()
    };
    lead.updated_at = new Date();
    await lead.save();

    const payment = await Payment.findOne({ lead_id });
    if (payment) {
      payment.status = 'refund_requested';
      await payment.save();
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('请求退款错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.approveRefund = async (req, res) => {
  const session = await require('mongoose').startSession();
  session.startTransaction();
  
  try {
    const { lead_id } = req.body;

    const lead = await Lead.findById(lead_id).session(session);
    if (!lead) {
      await session.abortTransaction();
      return res.status(404).json({ error: '订单不存在' });
    }

    if (lead.status !== 'refund_requested' && lead.status !== 'partial_refund_proposed') {
      await session.abortTransaction();
      return res.status(400).json({ error: '当前状态不允许同意退款' });
    }

    const refundAmount = lead.refund_request.requested_amount || lead.escrow_amount;

    const payment = await Payment.findOne({ lead_id }).session(session);
    if (payment) {
      payment.status = 'refunded';
      payment.refund_amount = refundAmount;
      payment.refunded_at = new Date();
      await payment.save({ session });
    }

    const wallet = await IntermediaryWallet.findOne({ intermediary_id: lead.intermediary_id }).session(session);
    if (wallet) {
      wallet.frozen_balance = Math.max(0, wallet.frozen_balance - refundAmount);
      wallet.updated_at = new Date();
      await wallet.save({ session });
    }

    lead.status = 'arbitrated_completed';
    lead.arbitration = {
      refund_to_buyer: refundAmount,
      pay_to_seller: 0,
      judgment_reason: '中介同意全额退款',
      arbitrated_by: 'system',
      arbitrated_at: new Date()
    };
    lead.updated_at = new Date();
    await lead.save({ session });

    await session.commitTransaction();
    res.json({ success: true, data: lead });
  } catch (error) {
    await session.abortTransaction();
    console.error('同意退款错误:', error);
    res.status(500).json({ error: '服务器错误' });
  } finally {
    session.endSession();
  }
};

exports.rejectRefund = async (req, res) => {
  try {
    const { lead_id } = req.body;

    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ error: '订单不存在' });
    }

    if (lead.status !== 'refund_requested') {
      return res.status(400).json({ error: '当前状态不允许拒绝退款' });
    }

    lead.status = 'dispute_reviewing';
    lead.dispute_deadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
    lead.updated_at = new Date();
    await lead.save();

    const payment = await Payment.findOne({ lead_id });
    if (payment) {
      payment.status = 'dispute_reviewing';
      await payment.save();
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('拒绝退款错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.proposePartialRefund = async (req, res) => {
  try {
    const { lead_id, proposed_amount, deduction_reason } = req.body;

    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ error: '订单不存在' });
    }

    if (lead.status !== 'refund_requested') {
      return res.status(400).json({ error: '当前状态不允许提出部分退款方案' });
    }

    if (proposed_amount >= lead.escrow_amount) {
      return res.status(400).json({ error: '部分退款金额应小于托管金额' });
    }

    lead.status = 'partial_refund_proposed';
    lead.partial_refund_proposal = {
      proposed_amount,
      deduction_reason,
      proposed_at: new Date()
    };
    lead.updated_at = new Date();
    await lead.save();

    const payment = await Payment.findOne({ lead_id });
    if (payment) {
      payment.status = 'partial_refund_proposed';
      await payment.save();
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('提出部分退款方案错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.acceptPartialRefund = async (req, res) => {
  const session = await require('mongoose').startSession();
  session.startTransaction();
  
  try {
    const { lead_id } = req.body;

    const lead = await Lead.findById(lead_id).session(session);
    if (!lead) {
      await session.abortTransaction();
      return res.status(404).json({ error: '订单不存在' });
    }

    if (lead.status !== 'partial_refund_proposed') {
      await session.abortTransaction();
      return res.status(400).json({ error: '当前状态不允许接受部分退款' });
    }

    const refundAmount = lead.partial_refund_proposal.proposed_amount;
    const sellerAmount = lead.escrow_amount - refundAmount;

    const payment = await Payment.findOne({ lead_id }).session(session);
    if (payment) {
      const platformFee = sellerAmount > 0 ? Math.round(sellerAmount * 0.05 * 100) / 100 : 0;
      payment.status = 'arbitrated_completed';
      payment.refund_amount = refundAmount;
      payment.settled_amount = sellerAmount - platformFee;
      payment.platform_fee = platformFee;
      payment.refunded_at = new Date();
      await payment.save({ session });
    }

    const wallet = await IntermediaryWallet.findOne({ intermediary_id: lead.intermediary_id }).session(session);
    if (wallet) {
      wallet.frozen_balance = Math.max(0, wallet.frozen_balance - lead.escrow_amount);
      if (sellerAmount > 0) {
        const platformFee = Math.round(sellerAmount * 0.05 * 100) / 100;
        wallet.available_balance += (sellerAmount - platformFee);
        wallet.total_earned += (sellerAmount - platformFee);
      }
      wallet.updated_at = new Date();
      await wallet.save({ session });
    }

    lead.status = 'arbitrated_completed';
    lead.arbitration = {
      refund_to_buyer: refundAmount,
      pay_to_seller: sellerAmount,
      judgment_reason: '双方达成部分退款协议',
      arbitrated_by: 'system',
      arbitrated_at: new Date()
    };
    lead.updated_at = new Date();
    await lead.save({ session });

    await session.commitTransaction();
    res.json({ success: true, data: lead });
  } catch (error) {
    await session.abortTransaction();
    console.error('接受部分退款错误:', error);
    res.status(500).json({ error: '服务器错误' });
  } finally {
    session.endSession();
  }
};

exports.rejectPartialRefund = async (req, res) => {
  try {
    const { lead_id } = req.body;

    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ error: '订单不存在' });
    }

    if (lead.status !== 'partial_refund_proposed') {
      return res.status(400).json({ error: '当前状态不允许拒绝部分退款' });
    }

    lead.status = 'dispute_reviewing';
    lead.dispute_deadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
    lead.updated_at = new Date();
    await lead.save();

    const payment = await Payment.findOne({ lead_id });
    if (payment) {
      payment.status = 'dispute_reviewing';
      await payment.save();
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('拒绝部分退款错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
