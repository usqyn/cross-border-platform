const Lead = require('../models/Lead');
const Payment = require('../models/Payment');
const IntermediaryWallet = require('../models/IntermediaryWallet');
const User = require('../models/User');
const Intermediary = require('../models/Intermediary');

exports.submitEvidence = async (req, res) => {
  try {
    const { lead_id, user_type, user_id, message, images } = req.body;

    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ error: '订单不存在' });
    }

    if (lead.status !== 'dispute_reviewing') {
      return res.status(400).json({ error: '当前状态不允许提交证据' });
    }

    const log = {
      user_type,
      user_id,
      message: message || '',
      images: images || [],
      submitted_at: new Date()
    };

    lead.dispute_logs.push(log);
    lead.updated_at = new Date();
    await lead.save();

    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('提交证据错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.getDisputeDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate('user_id', 'nickname avatar')
      .populate('intermediary_id', 'name');

    if (!lead) {
      return res.status(404).json({ error: '订单不存在' });
    }

    const logsWithUserInfo = await Promise.all(
      lead.dispute_logs.map(async (log) => {
        const logObj = log.toObject();
        if (log.user_id) {
          const user = await User.findById(log.user_id);
          logObj.user = user ? { nickname: user.nickname, avatar: user.avatar } : null;
        }
        return logObj;
      })
    );

    const leadData = lead.toObject();
    leadData.dispute_logs = logsWithUserInfo;

    res.json({ success: true, data: leadData });
  } catch (error) {
    console.error('获取纠纷详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.arbitrate = async (req, res) => {
  const session = await require('mongoose').startSession();
  session.startTransaction();
  
  try {
    const { order_id, refund_to_buyer_amount, pay_to_seller_amount, judgment_reason } = req.body;

    const lead = await Lead.findById(order_id).session(session);
    if (!lead) {
      await session.abortTransaction();
      return res.status(404).json({ error: '订单不存在' });
    }

    if (lead.status !== 'dispute_reviewing') {
      await session.abortTransaction();
      return res.status(400).json({ error: '当前状态不允许仲裁' });
    }

    const totalAmount = refund_to_buyer_amount + pay_to_seller_amount;
    if (Math.abs(totalAmount - lead.escrow_amount) > 0.01) {
      await session.abortTransaction();
      return res.status(400).json({ error: '退款与放款金额之和必须等于托管金额' });
    }

    const payment = await Payment.findOne({ lead_id: order_id }).session(session);
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ error: '支付记录不存在' });
    }

    let platformFee = 0;
    if (pay_to_seller_amount > 0) {
      platformFee = Math.round(pay_to_seller_amount * 0.05 * 100) / 100;
    }

    payment.status = 'arbitrated_completed';
    payment.refund_amount = refund_to_buyer_amount;
    payment.settled_amount = pay_to_seller_amount - platformFee;
    payment.platform_fee = platformFee;
    payment.refunded_at = new Date();
    payment.settled_at = new Date();
    await payment.save({ session });

    const wallet = await IntermediaryWallet.findOne({ intermediary_id: lead.intermediary_id }).session(session);
    if (wallet) {
      wallet.frozen_balance = Math.max(0, wallet.frozen_balance - lead.escrow_amount);
      if (pay_to_seller_amount > 0) {
        wallet.available_balance += (pay_to_seller_amount - platformFee);
        wallet.total_earned += (pay_to_seller_amount - platformFee);
      }
      wallet.updated_at = new Date();
      await wallet.save({ session });
    }

    lead.status = 'arbitrated_completed';
    lead.arbitration = {
      refund_to_buyer: refund_to_buyer_amount,
      pay_to_seller: pay_to_seller_amount,
      judgment_reason,
      arbitrated_by: 'admin',
      arbitrated_at: new Date()
    };
    lead.updated_at = new Date();
    await lead.save({ session });

    if (pay_to_seller_amount === 0 && lead.intermediary_id) {
      const intermediary = await Intermediary.findById(lead.intermediary_id).session(session);
      if (intermediary) {
        intermediary.credit_score = Math.max(0, intermediary.credit_score - 20);
        intermediary.has_full_responsibility_dispute = true;
        intermediary.dispute_warning_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await intermediary.save({ session });
      }
    }

    await session.commitTransaction();
    res.json({ success: true, data: lead });
  } catch (error) {
    await session.abortTransaction();
    console.error('仲裁错误:', error);
    res.status(500).json({ error: '服务器错误' });
  } finally {
    session.endSession();
  }
};
