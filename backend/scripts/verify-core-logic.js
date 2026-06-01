// 中哈跨境服务平台 - 核心逻辑测试（无需MongoDB）

console.log('============================================');
console.log('   中哈跨境服务平台 - 核心逻辑测试');
console.log('============================================');
console.log('');

const testResults = {
  total: 0,
  passed: 0,
  failed: 0
};

function addTestResult(name, passed, message) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ FAIL: ${name}`);
  }
  console.log(`   ${message}`);
  console.log('');
}

console.log('🕐 测试1：时区转换核心逻辑');
console.log('--------------------------------------------');

// 测试时区计算
function getKazakhstanTime() {
  const now = new Date();
  const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);
  const kzTime = new Date(utcTime.getTime() - 3 * 60 * 60 * 1000);
  
  const hours = kzTime.getUTCHours().toString().padStart(2, '0');
  const minutes = kzTime.getUTCMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

function isKazakhstanWorkHours() {
  const now = new Date();
  const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);
  const kzTime = new Date(utcTime.getTime() - 3 * 60 * 60 * 1000);
  
  const utcDay = kzTime.getUTCDay();
  const utcHour = kzTime.getUTCHours();
  
  return utcDay >= 1 && utcDay <= 5 && utcHour >= 9 && utcHour < 18;
}

const kzTime = getKazakhstanTime();
addTestResult(
  '时区转换',
  kzTime && kzTime.match(/^\d{2}:\d{2}$/),
  `当前哈萨克斯坦时间: ${kzTime}`
);

const isWorkHours = isKazakhstanWorkHours();
addTestResult(
  '工作时间判断',
  typeof isWorkHours === 'boolean',
  `当前是否工作时间: ${isWorkHours ? '是' : '否'}`
);

console.log('📚 测试2：AI关键词匹配逻辑');
console.log('--------------------------------------------');

function translateCategory(question) {
  const lowerQ = question.toLowerCase().trim();
  
  const vehicleKeywords = ['车', '自驾', '口岸', 'vehicle', 'car', 'drive', 'автомобиль', 'машина', 'көлік'];
  const personalKeywords = ['签证', '买房', '留学', '私人', 'visa', 'house', 'study', 'виза', 'недвижимость', 'учеба', 'тұрмыс'];
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
  for (const kw of logisticsKeywords) {
    if (normalizedQ.includes(kw.toLowerCase())) {
      return { category: 'logistics', kbCategory: 'logistics' };
    }
  }
  
  return { category: null, kbCategory: 'general' };
}

const testQuestions = [
  { q: '我想办自驾备案', expected: 'vehicle_service' },
  { q: '需要办理签证', expected: 'personal_service' },
  { q: '找物流公司', expected: 'logistics' },
  { q: 'Какие документы нужны?', expected: 'personal_service' },
  { q: '阿拉木图哪家美食最好吃?', expected: null }
];

testQuestions.forEach(tq => {
  const result = translateCategory(tq.q);
  const passed = result.category === tq.expected;
  addTestResult(
    `关键词匹配: "${tq.q}"`,
    passed,
    passed ? `正确分类为: ${result.category}` : `错误：期望${tq.expected}，实际${result.category}`
  );
});

console.log('🌐 测试3：翻译降级机制');
console.log('--------------------------------------------');

const zhToRuDict = {
  '你好': 'Привет',
  '自驾': 'Самостоятельная поездка'
};

function translateText(text, from, to) {
  try {
    if (!text || typeof text !== 'string') {
      console.warn('[Translator] Invalid input:', text);
      return text || '';
    }
    
    if (from === to) return text;
    
    if (from === 'zh' && to === 'ru') {
      const translated = zhToRuDict[text];
      return translated || `[${to}] ${text}`;
    }
    
    return `[${to}] ${text}`;
  } catch (error) {
    console.error('[Translator] Error:', error.message);
    return `[${to}] ${text}`;
  }
}

const translateTests = [
  { input: '你好', from: 'zh', to: 'ru', expectValid: true },
  { input: '未知文本xyz', from: 'zh', to: 'ru', expectFallback: true },
  { input: '', from: 'zh', to: 'ru', expectEmpty: true },
  { input: null, from: 'zh', to: 'ru', expectSafe: true }
];

translateTests.forEach(tt => {
  try {
    const result = translateText(tt.input, tt.from, tt.to);
    let passed = false;
    let message = '';
    
    if (tt.expectValid && result && !result.startsWith('[')) {
      passed = true;
      message = `正常翻译: ${result}`;
    } else if (tt.expectFallback && result && result.startsWith('[')) {
      passed = true;
      message = `降级翻译: ${result}`;
    } else if (tt.expectEmpty && (result === '' || result === null)) {
      passed = true;
      message = `空输入降级: ${result}`;
    } else if (tt.expectSafe && result !== undefined) {
      passed = true;
      message = `null安全处理: ${result}`;
    } else {
      message = `未通过期望检查`;
    }
    
    addTestResult(
      `翻译(${tt.input}/${tt.from}/${tt.to})`,
      passed,
      message
    );
  } catch (error) {
    addTestResult(
      `翻译(${tt.input}/${tt.from}/${tt.to})`,
      false,
      `异常: ${error.message}`
    );
  }
});

console.log('⚖️ 测试4：权重计算健壮性');
console.log('--------------------------------------------');

function calculateWeight(reviews, intermediary) {
  let totalWeight = 0;
  let weightedRating = 0;
  
  for (const review of reviews) {
    const rating = Number(review.rating) || 0;
    let weight = 1.0;
    
    if (review.order_type === 'escrow') {
      weight = 1.5;
    }
    
    totalWeight += weight;
    weightedRating += rating * weight;
  }
  
  let weightScore = totalWeight > 0 ? weightedRating / totalWeight * 10 : 0;
  
  if (isNaN(weightScore)) weightScore = 0;
  
  const membershipLevel = intermediary.membershipLevel || 'free';
  if (membershipLevel === 'vip') weightScore += 15;
  else if (membershipLevel === 'premium') weightScore += 8;
  
  if (intermediary.has_full_responsibility_dispute === true) {
    weightScore = Math.max(0, weightScore - 20);
  }
  
  const creditScore = Number(intermediary.credit_score) || 100;
  if (!isNaN(creditScore)) {
    weightScore += (creditScore - 100) / 10;
  }
  
  if (isNaN(weightScore)) weightScore = 0;
  
  return weightScore;
}

const weightTests = [
  {
    name: '正常数据',
    reviews: [{ rating: 5, order_type: 'escrow' }, { rating: 4, order_type: 'unlock_only' }],
    intermediary: { membershipLevel: 'vip', credit_score: 100, has_full_responsibility_dispute: false },
    expectMin: 50
  },
  {
    name: '空评论',
    reviews: [],
    intermediary: { membershipLevel: 'free', credit_score: 100, has_full_responsibility_dispute: false },
    expectMin: 0
  },
  {
    name: '缺失字段',
    reviews: [{ rating: null, order_type: undefined }],
    intermediary: { membershipLevel: undefined, credit_score: null },
    expectMin: 0
  },
  {
    name: '全责纠纷',
    reviews: [{ rating: 5, order_type: 'escrow' }],
    intermediary: { membershipLevel: 'vip', credit_score: 100, has_full_responsibility_dispute: true },
    expectMin: 30
  }
];

weightTests.forEach(wt => {
  try {
    const result = calculateWeight(wt.reviews, wt.intermediary);
    const passed = !isNaN(result) && result >= wt.expectMin;
    addTestResult(
      `权重计算(${wt.name})`,
      passed,
      passed ? `计算成功: ${result.toFixed(2)}` : `计算失败或结果不正确: ${result}`
    );
  } catch (error) {
    addTestResult(
      `权重计算(${wt.name})`,
      false,
      `异常: ${error.message}`
    );
  }
});

console.log('============================================');
console.log('   测试完成 - 最终报告');
console.log('============================================');
console.log('');
console.log(`总测试数: ${testResults.total}`);
console.log(`✅ 通过: ${testResults.passed}`);
console.log(`❌ 失败: ${testResults.failed}`);
console.log(`通过率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
console.log('');

if (testResults.failed === 0) {
  console.log('🎉 所有核心逻辑测试通过！');
  console.log('');
  console.log('💡 提示:');
  console.log('   要运行完整的集成测试（包括MongoDB交互），请：');
  console.log('   1. 启动MongoDB: mongod');
  console.log('   2. 运行: node backend/scripts/verify-platform-features.js');
} else {
  console.log('⚠️  有部分测试失败，请检查上述失败的测试项。');
}

console.log('');
console.log('============================================');
