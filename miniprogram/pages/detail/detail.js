const app = getApp();
import { getIntermediaryDetail, createLead } from '../../utils/api.js';
import { getTimezoneMessage, getKazakhstanTime } from '../../utils/timezone.js';

Page({
  data: {
    detail: null,
    showLeadModal: false,
    serviceTypes: ['vehicle', 'personal', 'business', 'logistics'],
    serviceTypeNames: ['车辆服务', '私人服务', '企业服务', '物流服务'],
    serviceTypeIndex: 0,
    departureDate: '',
    requirements: '',
    contactPhone: '',
    contactWechat: '',
    submitting: false,
    timezoneMessage: '',
    kazakhstanTime: ''
  },

  onLoad(options) {
    this.loadDetail(options.id);
    this.setData({ intermediaryId: options.id });
    this.updateTimezoneInfo();
    this.timezoneTimer = setInterval(() => {
      this.updateTimezoneInfo();
    }, 60000);
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage() {
    const lang = app.globalData.language;
    const detail = this.data.detail;
    const name = detail ? (detail.name || '中介服务') : '中哈跨境服务平台';
    
    const titles = {
      zh: `${name} - 专业跨境服务`,
      ru: `${name} - Кросс-граничные услуги`,
      kk: `${name} - Трансфронттілік қызметтер`
    };
    
    return {
      title: titles[lang] || titles.zh,
      path: `/pages/detail/detail?id=${this.data.intermediaryId}&lang=${lang}`,
      imageUrl: detail?.logo || ''
    };
  },

  onShareTimeline() {
    const lang = app.globalData.language;
    const detail = this.data.detail;
    const name = detail ? (detail.name || '中介服务') : '中哈跨境服务平台';
    
    const titles = {
      zh: `${name} - 推荐给您`,
      ru: `${name} - Рекомендую`,
      kk: `${name} - Рекомендую`
    };
    
    return {
      title: titles[lang] || titles.zh,
      query: `id=${this.data.intermediaryId}&lang=${lang}`,
      imageUrl: detail?.logo || ''
    };
  },

  onUnload() {
    if (this.timezoneTimer) {
      clearInterval(this.timezoneTimer);
    }
  },

  t(key) {
    return app.t(key);
  },

  updateTimezoneInfo() {
    this.setData({
      timezoneMessage: getTimezoneMessage(),
      kazakhstanTime: getKazakhstanTime()
    });
  },

  async loadDetail(id) {
    wx.showLoading({ title: '加载中' });
    try {
      const res = await getIntermediaryDetail(id, app.globalData.language);
      this.setData({ detail: res.data });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  openAIConsult() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  showLeadModal() {
    this.setData({ showLeadModal: true });
  },

  hideLeadModal() {
    this.setData({ showLeadModal: false });
  },

  stopPropagation() {},

  onServiceTypeChange(e) {
    this.setData({ serviceTypeIndex: parseInt(e.detail.value) });
  },

  onDateChange(e) {
    this.setData({ departureDate: e.detail.value });
  },

  onRequirementsInput(e) {
    this.setData({ requirements: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ contactPhone: e.detail.value });
  },

  onWechatInput(e) {
    this.setData({ contactWechat: e.detail.value });
  },

  async submitLead() {
    const { serviceTypes, serviceTypeIndex, departureDate, requirements, contactPhone, intermediaryId } = this.data;
    
    if (!requirements.trim()) {
      wx.showToast({ title: '请填写需求描述', icon: 'none' });
      return;
    }
    
    if (!contactPhone) {
      wx.showToast({ title: '请填写联系电话', icon: 'none' });
      return;
    }
    
    if (!departureDate) {
      wx.showToast({ title: '请选择办理时间', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    
    try {
      const userInfo = wx.getStorageSync('userInfo') || {};
      const userId = userInfo._id || 'mock_user_id';
      
      await createLead({
        user_id: userId,
        intermediary_id: intermediaryId,
        service_type: serviceTypes[serviceTypeIndex],
        requirements,
        departure_time: departureDate,
        contact_phone: contactPhone,
        contact_wechat: this.data.contactWechat
      });
      
      wx.showToast({ title: '提交成功', icon: 'success' });
      this.hideLeadModal();
      
      this.setData({
        requirements: '',
        contactPhone: '',
        contactWechat: '',
        departureDate: ''
      });
    } catch (err) {
      wx.showToast({
        title: err.error || '提交失败',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
