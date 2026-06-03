const app = getApp();
const { getIntermediaries } = require('../../utils/api.js');

Page({
  data: {
    categoryName: '',
    categoryType: '',
    intermediaries: [],
    loading: false,
    languages: ['中文', 'Русский', 'Қазақша'],
    langCodes: ['zh', 'ru', 'kk'],
    langIndex: 0
  },

  onLoad(options) {
    const { type, name } = options;
    this.setData({
      categoryType: type,
      categoryName: decodeURIComponent(name || '分类')
    });
    
    const lang = app.globalData.language;
    const index = this.data.langCodes.indexOf(lang);
    if (index > -1) {
      this.setData({ langIndex: index });
    }
    
    wx.setNavigationBarTitle({
      title: this.data.categoryName
    });
    
    this.loadIntermediaries();
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage() {
    const lang = app.globalData.language;
    return {
      title: `${this.data.categoryName} - 中哈跨境服务平台`,
      path: `/pages/category/category?type=${this.data.categoryType}&name=${encodeURIComponent(this.data.categoryName)}&lang=${lang}`,
      imageUrl: ''
    };
  },

  onShareTimeline() {
    const lang = app.globalData.language;
    return {
      title: `${this.data.categoryName} - 中哈跨境服务平台`,
      query: `type=${this.data.categoryType}&name=${encodeURIComponent(this.data.categoryName)}&lang=${lang}`,
      imageUrl: ''
    };
  },

  async loadIntermediaries() {
    this.setData({ loading: true });
    
    try {
      const res = await getRequest(`${app.globalData.baseUrl}/api/intermediaries`, {
        businessZone: this.data.categoryType,
        language: app.globalData.language,
        limit: 50
      });
      
      if (res.success) {
        this.setData({
          intermediaries: res.data || []
        });
      }
    } catch (err) {
      console.error('Load intermediaries failed:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
});

function getRequest(url, params) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data: params,
      header: {
        'content-type': 'application/json'
      },
      success: resolve,
      fail: reject
    });
  });
}