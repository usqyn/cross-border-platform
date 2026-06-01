App({
  globalData: {
    language: 'zh',
    baseUrl: 'http://localhost:3000/api'
  },
  onLaunch() {
    const lang = wx.getStorageSync('language');
    if (lang) {
      this.globalData.language = lang;
    }
  },
  setLanguage(lang) {
    this.globalData.language = lang;
    wx.setStorageSync('language', lang);
  },
  t(key) {
    const translations = {
      zh: {
        'app.title': '中哈跨境服务',
        'home.searchPlaceholder': '请输入您的问题...',
        'home.search': '搜索',
        'home.recommended': '推荐中介',
        'intermediary.certified': '官方认证',
        'intermediary.reviews': '条评价',
        'intermediary.contact': '联系',
        'intermediary.category.vehicle_service': '车辆服务',
        'intermediary.category.personal_service': '私人服务',
        'intermediary.category.business_service': '企业服务',
        'intermediary.category.logistics': '物流服务',
        'detail.credentials': '资质证书',
        'detail.cases': '服务案例',
        'detail.reviews': '用户评价',
        'detail.verified': '已验证用户',
        'language.switch': '切换语言',
        'language.zh': '中文',
        'language.ru': 'Русский',
        'language.kk': 'Қазақша'
      },
      ru: {
        'app.title': 'Китайско-Казахстанские трансграничные услуги',
        'home.searchPlaceholder': 'Введите ваш вопрос...',
        'home.search': 'Поиск',
        'home.recommended': 'Рекомендуемые посредники',
        'intermediary.certified': 'Официально сертифицирован',
        'intermediary.reviews': 'отзывов',
        'intermediary.contact': 'Контакт',
        'intermediary.category.vehicle_service': 'Автомобильные услуги',
        'intermediary.category.personal_service': 'Личные услуги',
        'intermediary.category.business_service': 'Бизнес-услуги',
        'intermediary.category.logistics': 'Логистические услуги',
        'detail.credentials': 'Сертификаты',
        'detail.cases': 'Кейсы',
        'detail.reviews': 'Отзывы',
        'detail.verified': 'Проверенный пользователь',
        'language.switch': 'Сменить язык',
        'language.zh': '中文',
        'language.ru': 'Русский',
        'language.kk': 'Қазақша'
      },
      kk: {
        'app.title': 'Қытай-Қазақстан шекаралық қызметтері',
        'home.searchPlaceholder': 'Сұрағыңызды енгізіңіз...',
        'home.search': 'Іздеу',
        'home.recommended': 'Ұсынылатын араласушылар',
        'intermediary.certified': 'Ресми сертификацияланған',
        'intermediary.reviews': 'пікірлер',
        'intermediary.contact': 'Байланыс',
        'intermediary.category.vehicle_service': 'Көлік қызметтері',
        'intermediary.category.personal_service': 'Жеке қызметтер',
        'intermediary.category.business_service': 'Бизнес қызметтері',
        'intermediary.category.logistics': 'Логистика қызметтері',
        'detail.credentials': 'Сертификаттар',
        'detail.cases': 'Кейстер',
        'detail.reviews': 'Пікірлер',
        'detail.verified': 'Тексерілген қолданушы',
        'language.switch': 'Тілді ауыстыру',
        'language.zh': '中文',
        'language.ru': 'Русский',
        'language.kk': 'Қазақша'
      }
    };
    return translations[this.globalData.language][key] || translations.zh[key] || key;
  }
});
