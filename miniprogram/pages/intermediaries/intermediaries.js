const app = getApp();
import { getIntermediaries } from '../../utils/api.js';

Page({
  data: {
    intermediaries: [],
    currentCategory: '',
    categories: [
      { key: '', name: '全部' },
      { key: 'vehicle_service', name: '车辆服务' },
      { key: 'personal_service', name: '私人服务' },
      { key: 'business_service', name: '企业服务' },
      { key: 'logistics', name: '物流服务' }
    ]
  },

  onLoad() {
    this.loadIntermediaries();
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  t(key) {
    return app.t(key);
  },

  onShareAppMessage() {
    const lang = app.globalData.language;
    const titles = {
      zh: '中哈跨境服务平台 - 精选中介服务商',
      ru: 'Кросс-граничная платформа - Сервисы посредников',
      kk: 'Қытай-Қазақстан платформасы - Араласушылар'
    };
    
    return {
      title: titles[lang] || titles.zh,
      path: `/pages/intermediaries/intermediaries?lang=${lang}`,
      imageUrl: ''
    };
  },

  onShareTimeline() {
    const lang = app.globalData.language;
    const titles = {
      zh: '中哈跨境服务平台 - 专业中介服务',
      ru: 'Кросс-граничная платформа Китай-Казахстан',
      kk: 'Қытай-Қазақстан трансфронттілік қызмет'
    };
    
    return {
      title: titles[lang] || titles.zh,
      query: `lang=${lang}`,
      imageUrl: ''
    };
  },

  async loadIntermediaries() {
    try {
      const params = { language: app.globalData.language };
      if (this.data.currentCategory) {
        params.category = this.data.currentCategory;
      }
      const res = await getIntermediaries(params);
      this.setData({ intermediaries: res.data });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  switchCategory(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ currentCategory: key });
    this.loadIntermediaries();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
});
