const app = getApp();

Page({
  data: {
    reviews: []
  },

  onLoad() {
    this.loadReviews();
  },

  async loadReviews() {
    wx.showLoading({ title: '加载中' });
    try {
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/reviews/list`,
        data: {
          intermediary_id: wx.getStorageSync('intermediaryId')
        }
      });
      if (res.data.success) {
        this.setData({ reviews: res.data.data || [] });
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  formatTime(time) {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1);
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }
});const app = getApp();

Page({
  data: {
    reviews: []
  },

  onLoad() {
    this.loadReviews();
  },

  async loadReviews() {
    wx.showLoading({ title: '加载中' });
    try {
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/reviews/list`,
        data: {
          intermediary_id: wx.getStorageSync('intermediaryId')
        }
      });
      if (res.data.success) {
        this.setData({ reviews: res.data.data || [] });
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  formatTime(time) {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1);
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }
});