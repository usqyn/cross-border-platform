const app = getApp();
import { getWallet, getLeadsList } from '../../utils/api.js';

Page({
  data: {
    wallet: {},
    pendingLeadsCount: 0,
    intermediaryId: ''
  },

  onLoad() {
    const intermediaryId = wx.getStorageSync('intermediaryId');
    if (intermediaryId) {
      this.setData({ intermediaryId });
      this.loadWallet(intermediaryId);
      this.loadLeads(intermediaryId);
    }
  },

  async loadWallet(intermediaryId) {
    try {
      const res = await getWallet(intermediaryId);
      this.setData({ wallet: res.data });
    } catch (err) {
      console.error('Load wallet error:', err);
    }
  },

  async loadLeads(intermediaryId) {
    try {
      const res = await getLeadsList({ status: 'pending_unlock', intermediary_id: null });
      this.setData({ pendingLeadsCount: res.data.length || 0 });
    } catch (err) {
      console.error('Load leads error:', err);
    }
  },

  goToLeads() {
    wx.navigateTo({ url: '/pages/admin-leads/admin-leads' });
  },

  goToOrders() {
    wx.navigateTo({ url: '/pages/admin-orders/admin-orders' });
  },

  goToReviews() {
    wx.navigateTo({ url: '/pages/admin-reviews/admin-reviews' });
  },

  goToProfile() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  }
});