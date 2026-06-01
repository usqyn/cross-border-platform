const app = getApp();
import { getLeadsList, unlockLead, createEscrowOrder } from '../../utils/api.js';

Page({
  data: {
    leads: [],
    activeTab: 'pending_unlock',
    showEscrowModal: false,
    currentLeadId: '',
    escrowAmount: '',
    submittingEscrow: false
  },

  serviceTypeMap: {
    'vehicle': '车辆服务',
    'personal': '私人服务',
    'business': '企业服务',
    'logistics': '物流服务'
  },

  statusTextMap: {
    'pending_unlock': '待解锁',
    'unlocked': '已对接',
    'completed': '已完成',
    'funds_escrowed': '资金托管中'
  },

  onLoad() {
    this.loadLeads();
  },

  onShow() {
    this.loadLeads();
  },

  async loadLeads() {
    wx.showLoading({ title: '加载中' });
    try {
      const intermediaryId = wx.getStorageSync('intermediaryId');
      const params = { status: this.data.activeTab };
      
      if (this.data.activeTab !== 'pending_unlock') {
        params.intermediary_id = intermediaryId;
      } else {
        params.intermediary_id = null;
      }
      
      const res = await getLeadsList(params);
      this.setData({ leads: res.data || [] });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  switchTab(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ activeTab: status });
    this.loadLeads();
  },

  getServiceTypeName(type) {
    return this.serviceTypeMap[type] || type;
  },

  getStatusText(status) {
    return this.statusTextMap[status] || status;
  },

  formatTime(time) {
    const date = new Date(time);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hour}:${minute}`;
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-lead-detail/admin-lead-detail?id=${id}`
    });
  },

  async unlockLead(e) {
    const leadId = e.currentTarget.dataset.id;
    const intermediaryId = wx.getStorageSync('intermediaryId');
    
    wx.showModal({
      title: '确认解锁',
      content: '消耗1积分查看客户联系方式？',
      success: async (res) => {
        if (res.confirm) {
          this.doUnlock(leadId, intermediaryId);
        }
      }
    });
  },

  async doUnlock(leadId, intermediaryId) {
    wx.showLoading({ title: '解锁中' });
    try {
      await unlockLead({ lead_id: leadId, intermediary_id: intermediaryId });
      wx.showToast({ title: '解锁成功', icon: 'success' });
      this.loadLeads();
    } catch (err) {
      wx.showToast({
        title: err.error || '解锁失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  createEscrow(e) {
    const leadId = e.currentTarget.dataset.id;
    this.setData({
      showEscrowModal: true, currentLeadId: leadId });
  },

  hideEscrowModal() {
    this.setData({ showEscrowModal: false });
  },

  stopPropagation() {},

  onAmountInput(e) {
    this.setData({ escrowAmount: e.detail.value });
  },

  async submitEscrow() {
    const amount = parseFloat(this.data.escrowAmount);
    if (!amount || amount <= 0) {
      wx.showToast({ title: '请输入有效金额', icon: 'none' });
      return;
    }

    this.setData({ submittingEscrow: true });
    try {
      const intermediaryId = wx.getStorageSync('intermediaryId');
      await createEscrowOrder({
        lead_id: this.data.currentLeadId,
        intermediary_id: intermediaryId,
        amount
      });
      
      wx.showToast({ title: '发起成功', icon: 'success' });
      this.hideEscrowModal();
      this.loadLeads();
    } catch (err) {
      wx.showToast({
        title: err.error || '发起失败',
        icon: 'none'
      });
    } finally {
      this.setData({ submittingEscrow: false });
    }
  }
});