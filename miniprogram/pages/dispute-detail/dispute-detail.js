const app = getApp();
import {
  getDisputeDetail,
  submitEvidence,
  approveRefund,
  rejectRefund,
  proposePartialRefund,
  acceptPartialRefund,
  rejectPartialRefund
} from '../../utils/api.js';

Page({
  data: {
    leadId: '',
    dispute: null,
    userType: 'buyer',
    userId: '',
    canSubmitEvidence: false,
    showActionButtons: false,
    isRefundRequested: false,
    isPartialProposed: false,
    isBuyer: true,
    isSeller: false,
    canProposePartial: false,
    message: '',
    images: [],
    proposedAmount: '',
    deductionReason: '',
    submitting: false,
    proposing: false
  },

  onLoad(options) {
    if (options.lead_id) {
      this.setData({ leadId: options.lead_id });
      this.loadDisputeDetail(options.lead_id);
    }
    if (options.user_type) {
      this.setData({ userType: options.user_type });
    }
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo._id) {
      this.setData({ userId: userInfo._id });
    }
  },

  async loadDisputeDetail(leadId) {
    wx.showLoading({ title: '加载中' });
    try {
      const res = await getDisputeDetail(leadId);
      this.setData({ dispute: res.data });
      this.updatePageState(res.data);
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  updatePageState(dispute) {
    const { userType } = this.data;
    const isBuyer = userType === 'buyer';
    const isSeller = userType === 'seller';
    const isRefundRequested = dispute.status === 'refund_requested';
    const isPartialProposed = dispute.status === 'partial_refund_proposed';
    const canSubmitEvidence = dispute.status === 'dispute_reviewing';
    const canProposePartial = isSeller && isRefundRequested;
    const showActionButtons = (isRefundRequested && isSeller) || (isPartialProposed && isBuyer);

    this.setData({
      isBuyer,
      isSeller,
      isRefundRequested,
      isPartialProposed,
      canSubmitEvidence,
      canProposePartial,
      showActionButtons
    });
  },

  getStatusText(status) {
    const statusMap = {
      'refund_requested': '退款申请中',
      'partial_refund_proposed': '部分退款方案',
      'dispute_reviewing': '平台介入中',
      'arbitrated_completed': '仲裁完成'
    };
    return statusMap[status] || status;
  },

  formatTime(time) {
    if (!time) return '';
    const date = new Date(time);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hour}:${minute}`;
  },

  formatDeadline(time) {
    if (!time) return '';
    const date = new Date(time);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hour}:${minute}`;
  },

  onMessageInput(e) {
    this.setData({ message: e.detail.value });
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

  async submitEvidence() {
    const { leadId, userId, userType, message, images } = this.data;
    if (!message.trim() && images.length === 0) {
      wx.showToast({ title: '请输入说明或上传图片', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    try {
      await submitEvidence({
        lead_id: leadId,
        user_id: userId,
        user_type: userType,
        message,
        images
      });
      wx.showToast({ title: '提交成功', icon: 'success' });
      this.setData({ message: '', images: [] });
      this.loadDisputeDetail(leadId);
    } catch (error) {
      wx.showToast({ title: error.error || '提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  async approveRefund() {
    wx.showModal({
      title: '确认退款',
      content: '确定同意全额退款吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中' });
          try {
            await approveRefund({ lead_id: this.data.leadId });
            wx.showToast({ title: '操作成功', icon: 'success' });
            this.loadDisputeDetail(this.data.leadId);
          } catch (error) {
            wx.showToast({ title: error.error || '操作失败', icon: 'none' });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  async rejectRefund() {
    wx.showModal({
      title: '拒绝退款',
      content: '确定拒绝退款申请吗？纠纷将进入平台介入阶段。',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中' });
          try {
            await rejectRefund({ lead_id: this.data.leadId });
            wx.showToast({ title: '操作成功', icon: 'success' });
            this.loadDisputeDetail(this.data.leadId);
          } catch (error) {
            wx.showToast({ title: error.error || '操作失败', icon: 'none' });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  async acceptPartialRefund() {
    wx.showModal({
      title: '确认接受',
      content: '确定接受这个部分退款方案吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中' });
          try {
            await acceptPartialRefund({ lead_id: this.data.leadId });
            wx.showToast({ title: '操作成功', icon: 'success' });
            this.loadDisputeDetail(this.data.leadId);
          } catch (error) {
            wx.showToast({ title: error.error || '操作失败', icon: 'none' });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  async rejectPartialRefund() {
    wx.showModal({
      title: '拒绝方案',
      content: '确定拒绝这个部分退款方案吗？纠纷将进入平台介入阶段。',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中' });
          try {
            await rejectPartialRefund({ lead_id: this.data.leadId });
            wx.showToast({ title: '操作成功', icon: 'success' });
            this.loadDisputeDetail(this.data.leadId);
          } catch (error) {
            wx.showToast({ title: error.error || '操作失败', icon: 'none' });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  onProposedAmountInput(e) {
    this.setData({ proposedAmount: e.detail.value });
  },

  onDeductionReasonInput(e) {
    this.setData({ deductionReason: e.detail.value });
  },

  async proposePartialRefund() {
    const { leadId, proposedAmount, deductionReason, dispute } = this.data;
    const amount = parseFloat(proposedAmount);
    if (!amount || amount <= 0 || amount >= dispute.escrow_amount) {
      wx.showToast({ title: '请输入有效退款金额', icon: 'none' });
      return;
    }
    if (!deductionReason.trim()) {
      wx.showToast({ title: '请填写扣款原因', icon: 'none' });
      return;
    }
    this.setData({ proposing: true });
    try {
      await proposePartialRefund({
        lead_id: leadId,
        proposed_amount: amount,
        deduction_reason: deductionReason
      });
      wx.showToast({ title: '方案已提出', icon: 'success' });
      this.setData({ proposedAmount: '', deductionReason: '' });
      this.loadDisputeDetail(leadId);
    } catch (error) {
      wx.showToast({ title: error.error || '操作失败', icon: 'none' });
    } finally {
      this.setData({ proposing: false });
    }
  }
});
