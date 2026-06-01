const IntermediaryWallet = require('../models/IntermediaryWallet');
const Intermediary = require('../models/Intermediary');

exports.getWallet = async (req, res) => {
  try {
    const { intermediary_id } = req.query;
    
    let wallet = await IntermediaryWallet.findOne({ intermediary_id });
    
    if (!wallet) {
      wallet = new IntermediaryWallet({
        intermediary_id,
        points_balance: 100,
        membership_level: 'free'
      });
      await wallet.save();
    }
    
    res.json({ success: true, data: wallet });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.addPoints = async (req, res) => {
  try {
    const { intermediary_id, points } = req.body;
    
    let wallet = await IntermediaryWallet.findOne({ intermediary_id });
    if (!wallet) {
      wallet = new IntermediaryWallet({
        intermediary_id,
        points_balance: 0,
        membership_level: 'free'
      });
    }
    
    wallet.points_balance += points;
    wallet.updated_at = new Date();
    await wallet.save();
    
    res.json({ success: true, data: wallet });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { intermediary_id, amount } = req.body;
    
    const wallet = await IntermediaryWallet.findOne({ intermediary_id });
    if (!wallet) {
      return res.status(404).json({ error: '钱包不存在' });
    }
    
    if (wallet.available_balance < amount) {
      return res.status(400).json({ error: '可用余额不足' });
    }
    
    wallet.available_balance -= amount;
    wallet.updated_at = new Date();
    await wallet.save();
    
    res.json({ success: true, data: wallet });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
