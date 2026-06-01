const app = getApp();

Page({
  data: {
    orders: [],
    activeTab: 'all'
  },

  serviceTypeMap: {
    'vehicle': '车辆服务',
    'personal': '私人服务',
    'business': '企业服务',
    'logistics': '物流服务'
  },

  statusTextMap: {
    'pending': '待支付',
    'paid': '服务中',
    'settled': '已完成'
  },

  onLoad() {
    this.loadOrders();
  },

  async loadOrders() {
    wx.showLoading({ title: '加载中' });
    try {
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/payments/list`,
        data: {
          intermediary_id: wx.getStorageSync('intermediaryId')
        }
      });
      if (res.data.success) {
        this.setData({ orders: res.data.data || [] });
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  switchTab(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ activeTab: status });
    this.loadOrders();
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

  uploadProof(e) {
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        wx.showToast({ title: '上传成功', icon: 'success' });
        this.loadOrders();
      }
    });
  }
});