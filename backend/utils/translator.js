// Mock translation functions - in production, replace with real LLM API calls
const zhToRuDict = {
  '我想办自驾备案，车是坦克300。': 'Я хочу оформить регистрацию для самостоятельной поездки, машина Tank 300.',
  '你好': 'Привет',
  '谢谢': 'Спасибо',
  '好的': 'Хорошо',
  '收到': 'Принято',
  '请问需要什么材料？': 'Какие документы нужны, пожалуйста?',
  '霍尔果斯口岸': 'Порт Хоргос',
  '阿拉木图': 'Алматы',
  '哈萨克斯坦': 'Казахстан',
  '自驾': 'Самостоятельная поездка',
  '签证': 'Виза',
  '物流': 'Логистика',
  '车辆通关': 'Таможенное оформление автомобиля',
  '可以的，我们可以办理': 'Да, мы можем помочь с оформлением',
  '需要准备：驾驶证、行驶证、身份证、保险单': 'Нужно подготовить: водительское удостоверение, свидетельство о регистрации, паспорт, страховку'
};

const zhToKkDict = {
  '我想办自驾备案，车是坦克300。': 'Мен өзімдірге қатысты тіркеу жасауым керек, көлімі Tank 300.',
  '你好': 'Сәлем',
  '谢谢': 'Рахмет',
  '好的': 'Жарайды',
  '收到': 'Қабылдадым',
  '请问需要什么材料？': 'Сұрайық, қандай құжаттар керек?',
  '霍尔果斯口岸': 'Хоргос порты',
  '阿拉木图': 'Алматы',
  '哈萨克斯坦': 'Қазақстан',
  '自驾': 'Өз көлімен саяхат',
  '签证': 'Виза',
  '物流': 'Логистика',
  '车辆通关': 'Көліктің кедендік тіркеуі',
  '可以的，我们可以办理': 'Иә, біз жасай аламыз',
  '需要准备：驾驶证、行驶证、身份证、保险单': 'Тәйyarлау керек: жүріс куәлігі, көлік тіркеу куәлігі, кімдік, сақтандыру'
};

const ruToZhDict = {
  'Я хочу оформить регистрацию для самостоятельной поездки, машина Tank 300.': '我想办自驾备案，车是坦克300。',
  'Привет': '你好',
  'Спасибо': '谢谢',
  'Хорошо': '好的',
  'Принято': '收到',
  'Какие документы нужны, пожалуйста?': '请问需要什么材料？',
  'Да, мы можем помочь с оформлением': '可以的，我们可以办理',
  'Нужно подготовить: водительское удостоверение, свидетельство о регистрации, паспорт, страховку': '需要准备：驾驶证、行驶证、身份证、保险单'
};

const kkToZhDict = {
  'Мен өзімдірге қатысты тіркеу жасауым керек, көлімі Tank 300.': '我想办自驾备案，车是坦克300。',
  'Сәлем': '你好',
  'Рахмет': '谢谢',
  'Жарайды': '好的',
  'Қабылдадым': '收到',
  'Сұрайық, қандай құжаттар керек?': '请问需要什么材料？',
  'Иә, біз жасай аламыз': '可以的，我们可以办理',
  'Тәйyarлау керек: жүріс куәлігі, көлік тіркеу куәлігі, кімдік, сақтандыру': '需要准备：驾驶证、行驶证、身份证、保险单'
};

function translateText(text, from, to) {
  try {
    if (!text || typeof text !== 'string') {
      console.warn('[Translator] Invalid input text:', text);
      return text || '';
    }
    
    if (from === to) {
      return text;
    }
    
    let translated = text;
    
    if (from === 'zh' && to === 'ru') {
      translated = zhToRuDict[text];
    } else if (from === 'zh' && to === 'kk') {
      translated = zhToKkDict[text];
    } else if (from === 'ru' && to === 'zh') {
      translated = ruToZhDict[text];
    } else if (from === 'kk' && to === 'zh') {
      translated = kkToZhDict[text];
    } else if (from === 'ru' && to === 'kk') {
      const zhText = ruToZhDict[text] || text;
      translated = zhToKkDict[zhText] || `[${to}] ${text}`;
    } else if (from === 'kk' && to === 'ru') {
      const zhText = kkToZhDict[text] || text;
      translated = zhToRuDict[zhText] || `[${to}] ${text}`;
    } else {
      translated = `[${to}] ${text}`;
    }
    
    if (!translated) {
      console.warn(`[Translator] No translation found for: ${text.substring(0, 50)}...`);
      return `[${to}] ${text}`;
    }
    
    return translated;
  } catch (error) {
    console.error('[Translator] Translation error:', error.message);
    return `[${to}] ${text}`;
  }
}

function translateToAllLanguages(text, fromLang = 'zh') {
  const translations = {
    zh: text,
    ru: text,
    kk: text
  };
  
  if (!text || typeof text !== 'string') {
    console.warn('[Translator] Invalid input for translateToAllLanguages');
    return translations;
  }
  
  try {
    if (fromLang === 'zh') {
      translations.zh = text;
      translations.ru = translateText(text, 'zh', 'ru');
      translations.kk = translateText(text, 'zh', 'kk');
    } else if (fromLang === 'ru') {
      translations.zh = translateText(text, 'ru', 'zh');
      translations.ru = text;
      translations.kk = translateText(text, 'ru', 'kk');
    } else if (fromLang === 'kk') {
      translations.zh = translateText(text, 'kk', 'zh');
      translations.ru = translateText(text, 'kk', 'ru');
      translations.kk = text;
    } else {
      translations.zh = translateText(text, fromLang, 'zh');
      translations.ru = translateText(text, fromLang, 'ru');
      translations.kk = translateText(text, fromLang, 'kk');
    }
  } catch (error) {
    console.error('[Translator] Error in translateToAllLanguages:', error.message);
  }
  
  return translations;
}

module.exports = {
  translateText,
  translateToAllLanguages
};
