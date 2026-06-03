const app = getApp();
import { askAI, getBorderStatuses } from '../../utils/api.js';

Page({
  data: {
    question: '',
    answer: '',
    intermediaries: [],
    loading: false,
    borderStatuses: [],
    languages: ['中文', 'Русский', 'Қазақша'],
    langCodes: ['zh', 'ru', 'kk'],
    langIndex: 0,
    currentLang: '中文'
  },

  onLoad() {
    const lang = app.globalData.language;
    const index = this.data.langCodes.indexOf(lang);
    if (index > -1) {
      this.setData({
        langIndex: index,
        currentLang: this.data.languages[index]
      });
    }
    this.loadBorderStatuses();
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage() {
    const lang = app.globalData.language;
    const titles = {
      zh: '中哈跨境服务平台 - 专业签证与自驾备案服务',
      ru: 'Кросс-граничная платформа Китай-Казахстан',
      kk: 'Қытай-Қазақстан трансфронттілік қызмет платформасы'
    };
    
    return {
      title: titles[lang] || titles.zh,
      path: `/pages/index/index?lang=${lang}`,
      imageUrl: ''
    };
  },

  onShareTimeline() {
    const lang = app.globalData.language;
    const titles = {
      zh: '中哈跨境服务平台 - 一站式跨境服务专家',
      ru: 'Кросс-граничная платформа Китай-Казахстан',
      kk: 'Қытай-Қазақстан трансфронттілік қызмет'
    };
    
    return {
      title: titles[lang] || titles.zh,
      query: `lang=${lang}`,
      imageUrl: ''
    };
  },

  t(key) {
    return app.t(key);
  },

  onLanguageChange(e) {
    const index = e.detail.value;
    const langCode = this.data.langCodes[index];
    app.setLanguage(langCode);
    this.setData({
      langIndex: index,
      currentLang: this.data.languages[index]
    });
  },

  onInput(e) {
    this.setData({ question: e.detail.value });
  },

  async onSearch() {
    if (!this.data.question.trim()) {
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const res = await askAI(this.data.question, app.globalData.language);
      this.setData({
        answer: res.answer,
        intermediaries: res.intermediaries
      });
    } catch (err) {
      wx.showToast({
        title: '请求失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadBorderStatuses() {
    try {
      const res = await getBorderStatuses();
      this.setData({ borderStatuses: res.data || [] });
    } catch (err) {
      console.error('Load border statuses failed:', err);
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  goToCategory(e) {
    const type = e.currentTarget.dataset.type;
    const typeNames = {
      'visa_legal': '签证法务',
      'customs_auto': '口岸自驾',
      'real_estate': '房产投资',
      'study_life': '留学生活'
    };
    
    wx.navigateTo({
      url: `/pages/category/category?type=${type}&name=${encodeURIComponent(typeNames[type] || '分类')}`
    });
  }
});
