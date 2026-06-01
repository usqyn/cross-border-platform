const KnowledgeBase = require('../models/KnowledgeBase');
const Intermediary = require('../models/Intermediary');

const translateCategory = (question) => {
  const lowerQ = question.toLowerCase().trim();
  
  const vehicleKeywords = ['车', '自驾', '口岸', 'vehicle', 'car', 'drive', 'автомобиль', 'машина', 'көлік'];
  const personalKeywords = ['签证', '买房', '留学', '私人', 'visa', 'house', 'study', 'виза', 'недвижимость', 'учеба', 'виза', 'тұрмыс'];
  const businessKeywords = ['公司', '商务', '市场', '企业', 'company', 'business', 'компания', 'бизнес'];
  const logisticsKeywords = ['物流', '货运', 'logistics', 'cargo', 'логистика', 'груз', 'жүк'];
  
  const normalizedQ = lowerQ.replace(/[\s\-_,.!@#$%^&*()]+/g, '');
  
  for (const kw of vehicleKeywords) {
    if (normalizedQ.includes(kw.toLowerCase())) {
      return { category: 'vehicle_service', kbCategory: 'vehicle' };
    }
  }
  for (const kw of personalKeywords) {
    if (normalizedQ.includes(kw.toLowerCase())) {
      return { category: 'personal_service', kbCategory: 'personal' };
    }
  }
  for (const kw of businessKeywords) {
    if (normalizedQ.includes(kw.toLowerCase())) {
      return { category: 'business_service', kbCategory: 'business' };
    }
  }
  for (const kw of logisticsKeywords) {
    if (normalizedQ.includes(kw.toLowerCase())) {
      return { category: 'logistics', kbCategory: 'logistics' };
    }
  }
  
  return { category: null, kbCategory: 'general' };
};

const calculateWeight = (inter) => {
  let weight = 0;
  
  const membershipLevel = inter.membershipLevel || 'basic';
  if (membershipLevel === 'vip') weight += 15;
  else if (membershipLevel === 'premium') weight += 8;
  
  const creditScore = inter.credit_score || 100;
  weight += (creditScore - 100) / 10;
  
  const rating = inter.rating || 0;
  weight += rating * 2;
  
  if (inter.has_full_responsibility_dispute) {
    weight -= 20;
  }
  
  return weight;
};

const buildAnswer = (knowledge, language) => {
  if (!knowledge || knowledge.length === 0) {
    const noAnswer = {
      zh: '抱歉，目前没有找到相关的政策信息。建议您直接联系下方经过平台认证的中介服务商获取最准确的信息。',
      ru: 'К сожалению, мы не нашли соответствующей информации о политике. Рекомендуем напрямую связаться с сертифицированными посредниками ниже для получения точной информации.',
      kk: 'Кешіріңіз, бізде сәйкес саясат туралы ақпарат жоқ. Дәл ақпарат алу үшін төмендегі сертификатталған делдалдармен тікелей байланысуды ұсынамыз.'
    };
    return noAnswer[language] || noAnswer.zh;
  }
  
  const answers = knowledge.map(k => {
    const contentMap = k.content;
    let text = '';
    if (contentMap && typeof contentMap.get === 'function') {
      text = contentMap.get(language) || contentMap.get('zh') || '';
    } else if (contentMap && typeof contentMap === 'object') {
      text = contentMap[language] || contentMap.zh || '';
    }
    return text;
  }).filter(t => t.length > 0);
  
  return answers.length > 0 ? answers.join('\n\n') : noAnswer[language] || noAnswer.zh;
};

exports.askAI = async (req, res) => {
  try {
    const { question, language = 'zh' } = req.body;
    if (!question) {
      return res.status(400).json({ error: '问题不能为空' });
    }
    const { category, kbCategory } = translateCategory(question);
    const query = { isActive: true };
    if (kbCategory !== 'general') {
      query.category = kbCategory;
    }
    const knowledge = await KnowledgeBase.find(query).limit(3);
    const answer = buildAnswer(knowledge, language);
    let intermediaries = [];
    if (category) {
      intermediaries = await Intermediary.find({ category, isCertified: true });
    } else {
      intermediaries = await Intermediary.find({ isCertified: true });
    }
    
    intermediaries = intermediaries.sort((a, b) => {
      return calculateWeight(b) - calculateWeight(a);
    }).slice(0, 6);
    
    res.json({
      success: true,
      answer,
      intermediaries: intermediaries.map(inter => {
        const nameMap = inter.name;
        const descMap = inter.description;
        
        let name = '';
        if (nameMap && typeof nameMap.get === 'function') {
          name = nameMap.get(language) || nameMap.get('zh') || '未命名中介';
        } else if (nameMap && typeof nameMap === 'object') {
          name = nameMap[language] || nameMap.zh || '未命名中介';
        } else {
          name = String(nameMap || '未命名中介');
        }
        
        let description = '';
        if (descMap && typeof descMap.get === 'function') {
          description = descMap.get(language) || descMap.get('zh') || '';
        } else if (descMap && typeof descMap === 'object') {
          description = descMap[language] || descMap.zh || '';
        } else {
          description = String(descMap || '');
        }
        
        return {
          id: inter._id,
          name,
          logo: inter.logo || '',
          category: inter.category || '',
          isCertified: inter.isCertified || false,
          membershipLevel: inter.membershipLevel || 'basic',
          vipLevel: inter.vipLevel || 'normal',
          rating: inter.rating || 0,
          reviewCount: inter.reviewCount || 0,
          credit_score: inter.credit_score || 100,
          weight_score: calculateWeight(inter),
          tags: inter.tags || [],
          description,
          contact: inter.contact || {}
        };
      })
    });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
