const app = getApp();
import { requestRefund, getLeadDetail } from '../../utils/api.js';

Page({
  data: {
    leadId: '',
    escrowAmount: 0,
    requestedAmount: '',
    reason: '',
    images: [],
    submitting: false
  },

  onLoad(options) {
    if (options.lead_id) {
      this.setData({ leadId: options.lead_id });
      this.loadLeadDetail(options.lead_id);
    }
  },

  async loadLeadDetail(leadId) {
    try {
      const res = await getLeadDetail(leadId);
      this.setData({ 
        escrowAmount: res.data.escrow_amount,
        requestedAmount: res.data.escrow_amount.toString()
      });
    } catch (error) {
      wx.showToast({ title: '加载订单信息失败', icon: 'none' });
    }
  },

  onAmountInput(e) {
    this.setData({ requestedAmount: e.detail.value });
  },

  onReasonInput(e) {
    this.setData({ reason: e.detail.value });
  },

  chooseImages() {
    const maxCount = 5 - (this.data.images.length || 0);
    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = this.data.images.concat(res.tempFilePaths);
        this.setData({ images: newImages });
      }
    });
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.images];
    images.splice(index, 1);
    this.setData({ images });
  },

  async submitRefund() {
    const { leadId, requestedAmount, reason, images } = this.data;

    const amount = parseFloat(requestedAmount);
    if (!amount || amount <= 0) {
      wx.showToast({ title: '请输入有效金额', icon: 'none' });
      return;
    }

    if (amount > this.data.escrowAmount) {
      wx.showToast({ title: '退款金额不能超过订单金额', icon: 'none' });
      return;
    }

    if (!reason.trim()) {
      wx.showToast({ title: '请填写退款原因', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    try {
      const userInfo = wx.getStorageSync('userInfo');
      await requestRefund({
        lead_id: leadId,
        requested_amount: amount,
        reason,
        evidences: images
      });

      wx.showToast({ title: '申请提交成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      wx.showToast({ title: error.error || '提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
