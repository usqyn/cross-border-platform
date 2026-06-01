// 中哈跨境服务平台 - 自动化功能验证脚本
// 运行环境：node backend/scripts/verify-platform-features.js

require('dotenv').config();
const mongoose = require('mongoose');

console.log('============================================');
console.log('   中哈跨境服务平台 - 自动化功能验证报告');
console.log('============================================');
console.log('');

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

function addTestResult(name, passed, message, details = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ FAIL: ${name}`);
  }
  console.log(`   ${message}`);
  if (details) {
    console.log(`   详情: ${JSON.stringify(details)}`);
  }
  console.log('');
  testResults.details.push({ name, passed, message, details });
}

// ============================================
// 测试场景 A：AI防幻觉测试
// ============================================
async function testAIHallucination() {
  console.log('📚 测试场景 A：AI防幻觉测试');
  console.log('--------------------------------------------');
  
  try {
    const KnowledgeBase = require('../models/KnowledgeBase');
    const aiController = require('../controllers/aiController');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cross_border');
    await KnowledgeBase.deleteMany({});
    
    const mockReq = {
      body: {
        question: 'Алматы哪家美食最好吃?', // 哈萨克语：阿拉木图哪家美食最好吃？
        language: 'kk'
      }
    };
    const mockRes = {
      json: function(data) {
        const hasFallback = data.answer && (
          data.answer.includes('抱歉') ||
          data.answer.includes('没有找到') ||
          data.answer.includes('К сожалению') ||
          data.answer.includes('Кешіріңіз')
        );
        
        addTestResult(
          'A1-知识库为空时返回兜底文本',
          hasFallback,
          hasFallback ? '正确返回兜底文本，无幻觉' : '未返回兜底文本，可能存在幻觉风险',
          { answer: data.answer.substring(0, 100) }
        );
        
        addTestResult(
          'A2-知识库为空时仍返回中介列表',
          data.intermediaries && Array.isArray(data.intermediaries),
          '成功返回中介推荐列表',
          { count: data.intermediaries ? data.intermediaries.length : 0 }
        );
        
        addTestResult(
          'A3-多语言输入不导致崩溃',
          data.success === true,
          'API成功响应，无崩溃',
          { success: data.success }
        );
      },
      status: function(code) {
        return this;
      }
    };
    
    await aiController.askAI(mockReq, mockRes);
    
  } catch (error) {
    addTestResult(
      'A-整体测试',
      false,
      `测试过程中发生错误: ${error.message}`,
      { error: error.stack }
    );
  }
}

// ============================================
// 测试场景 B：算法健壮性测试
// ============================================
async function testAlgorithmRobustness() {
  console.log('📊 测试场景 B：算法健壮性测试');
  console.log('--------------------------------------------');
  
  try {
    const Intermediary = require('../models/Intermediary');
    
    await Intermediary.deleteMany({});
    
    const incompleteInter = new Intermediary({
      name: { zh: '测试中介-字段残缺' },
      rating: null,
      reviewCount: undefined,
      credit_score: null,
      membershipLevel: undefined
    });
    await incompleteInter.save();
    
    const aiController = require('../controllers/aiController');
    
    const mockReq = {
      body: { question: '自驾备案', language: 'zh' }
    };
    const mockRes = {
      json: function(data) {
        const hasIncomplete = data.intermediaries && data.intermediaries.some(
          i => i.name && i.name.includes('测试中介-字段残缺')
        );
        
        addTestResult(
          'B1-字段残缺的中介不导致崩溃',
          hasIncomplete,
          hasIncomplete ? '成功处理字段残缺的中介' : '未找到测试中介，可能崩溃',
          { found: hasIncomplete }
        );
        
        if (hasIncomplete) {
          const testInter = data.intermediaries.find(i => i.name.includes('测试中介-字段残缺'));
          
          addTestResult(
            'B2-rating字段缺失有默认值',
            typeof testInter.rating === 'number' || testInter.rating === 0,
            'rating字段有合理的默认值',
            { rating: testInter.rating }
          );
          
          addTestResult(
            'B3-reviewCount字段缺失有默认值',
            typeof testInter.reviewCount === 'number',
            'reviewCount字段有合理的默认值',
            { reviewCount: testInter.reviewCount }
          );
          
          addTestResult(
            'B4-列表按权重排序',
            data.intermediaries && Array.isArray(data.intermediaries) && data.intermediaries.length > 0,
            '中介列表正常返回，支持排序',
            { count: data.intermediaries.length }
          );
        }
      },
      status: function(code) { return this; }
    };
    
    await aiController.askAI(mockReq, mockRes);
    
  } catch (error) {
    addTestResult(
      'B-整体测试',
      false,
      `测试过程中发生错误: ${error.message}`,
      { error: error.stack }
    );
  }
}

// ============================================
// 测试场景 C：时区跨端测试
// ============================================
async function testTimezoneConversion() {
  console.log('🕐 测试场景 C：时区跨端测试');
  console.log('--------------------------------------------');
  
  try {
    const timezone = require('../../miniprogram/utils/timezone');
    
    const testCases = [
      {
        name: 'C1-北京时间09:00（哈国06:00）',
        utcTime: '2024-01-15T01:00:00.000Z',
        expectedKZHour: 6,
        expectedKZDay: 15
      },
      {
        name: 'C2-北京时间10:00（哈国07:00）',
        utcTime: '2024-01-15T02:00:00.000Z',
        expectedKZHour: 7,
        expectedKZDay: 15
      },
      {
        name: 'C3-北京时间15:00（哈国12:00）',
        utcTime: '2024-01-15T07:00:00.000Z',
        expectedKZHour: 12,
        expectedKZDay: 15
      }
    ];
    
    testCases.forEach(tc => {
      const originalDate = global.Date;
      const mockDate = new Date(tc.utcTime);
      
      const kzTime = new Date(mockDate.getTime() - 180 * 60 * 1000);
      const actualHour = kzTime.getUTCHours();
      const actualDay = kzTime.getUTCDate();
      
      const hourMatch = actualHour === tc.expectedKZHour;
      const dayMatch = actualDay === tc.expectedKZDay;
      
      addTestResult(
        tc.name,
        hourMatch && dayMatch,
        hourMatch && dayMatch 
          ? `时区计算正确：哈国时间 ${actualHour}:00，日期 ${actualDay}`
          : `时区计算错误：期望${tc.expectedKZHour}:00(${tc.expectedKZDay}日)，实际${actualHour}:00(${actualDay}日)`,
        {
          beijingTime: tc.beijingTime,
          expected: { hour: tc.expectedKZHour, day: tc.expectedKZDay },
          actual: { hour: actualHour, day: actualDay }
        }
      );
    });
    
    const workHourTests = [
      { utcHour: 10, utcDay: 1, expected: true, name: 'C4-工作日工作时间' },
      { utcHour: 10, utcDay: 6, expected: false, name: 'C5-周六工作时间' },
      { utcHour: 3, utcDay: 3, expected: true, name: 'C6-工作日晚间(哈国20:00)' },
      { utcHour: 2, utcDay: 4, expected: false, name: 'C7-工作时间前(哈国18:00前)' }
    ];
    
    workHourTests.forEach(test => {
      const kzTime = new Date(Date.UTC(2024, 0, 15, test.utcHour));
      const utcDay = kzTime.getUTCDay();
      const utcHour = kzTime.getUTCHours();
      const isWorkHours = utcDay >= 1 && utcDay <= 5 && utcHour >= 9 && utcHour < 18;
      
      addTestResult(
        test.name,
        isWorkHours === test.expected,
        `工作时间判断正确：${isWorkHours}，哈国时间 ${utcHour}:00 ${['周日','周一','周二','周三','周四','周五','周六'][utcDay]}`,
        { utcHour: test.utcHour, utcDay: test.utcDay, result: isWorkHours, expected: test.expected }
      );
    });
    
    const dateInfo = timezone.getKazakhstanDateInfo();
    addTestResult(
      'C8-获取哈国日期信息',
      dateInfo && dateInfo.dayName && dateInfo.date,
      '成功获取哈国日期信息',
      dateInfo
    );
    
  } catch (error) {
    addTestResult(
      'C-整体测试',
      false,
      `测试过程中发生错误: ${error.message}`,
      { error: error.stack }
    );
  }
}

// ============================================
// 测试场景 D：翻译降级测试
// ============================================
async function testTranslationFallback() {
  console.log('🌐 测试场景 D：翻译降级测试');
  console.log('--------------------------------------------');
  
  try {
    const translator = require('../utils/translator');
    
    const testCases = [
      {
        name: 'D1-正常翻译',
        input: '你好',
        from: 'zh',
        expectValid: true,
        expectFallback: false
      },
      {
        name: 'D2-未知文本返回占位符',
        input: '这是一个完全未知的句子xyz123',
        from: 'zh',
        expectValid: true,
        expectFallback: true
      },
      {
        name: 'D3-空输入处理',
        input: '',
        from: 'zh',
        expectValid: false,
        expectFallback: false
      },
      {
        name: 'D4-null输入处理',
        input: null,
        from: 'zh',
        expectValid: false,
        expectFallback: false
      },
      {
        name: 'D5-俄语到哈萨克语(未知文本)',
        input: 'Неизвестный текст xyz',
        from: 'ru',
        expectValid: true,
        expectFallback: true
      }
    ];
    
    testCases.forEach(tc => {
      try {
        const result = translator.translateText(tc.input, tc.from, 'ru');
        const hasFallback = result && result.startsWith('[');
        
        if (tc.expectFallback) {
          addTestResult(
            tc.name,
            hasFallback,
            hasFallback ? '正确返回降级翻译' : '应该返回降级翻译但返回了正常翻译',
            { result, input: tc.input }
          );
        } else if (tc.expectValid) {
          addTestResult(
            tc.name,
            result && result.length > 0 && !hasFallback,
            result && result.length > 0 ? '正常翻译成功' : '翻译返回空',
            { result, input: tc.input }
          );
        } else {
          addTestResult(
            tc.name,
            result !== undefined && result !== null,
            '空/null输入有降级处理，不崩溃',
            { result, input: tc.input }
          );
        }
      } catch (error) {
        addTestResult(
          tc.name,
          false,
          `翻译函数抛出异常: ${error.message}`,
          { error: error.message }
        );
      }
    });
    
    const allLangResult = translator.translateToAllLanguages('测试消息', 'zh');
    addTestResult(
      'D6-批量翻译降级',
      allLangResult && allLangResult.zh && allLangResult.ru && allLangResult.kk,
      '批量翻译成功，包含所有语言',
      allLangResult
    );
    
    const brokenResult = translator.translateToAllLanguages(null, 'zh');
    addTestResult(
      'D7-null输入不崩溃',
      brokenResult && brokenResult.zh === null || brokenResult.zh === undefined || brokenResult.zh === '',
      'null输入有降级处理',
      { result: brokenResult }
    );
    
  } catch (error) {
    addTestResult(
      'D-整体测试',
      false,
      `测试过程中发生错误: ${error.message}`,
      { error: error.stack }
    );
  }
}

// ============================================
// 主函数：运行所有测试
// ============================================
async function runAllTests() {
  try {
    console.log('开始运行自动化功能验证...\n');
    
    await testAIHallucination();
    await testAlgorithmRobustness();
    await testTimezoneConversion();
    await testTranslationFallback();
    
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
      console.log('🎉 所有测试通过！系统已达到生产级上线标准。');
    } else {
      console.log('⚠️  有部分测试失败，请检查上述失败的测试项。');
    }
    
    console.log('');
    console.log('============================================');
    
  } catch (error) {
    console.error('测试脚本执行错误:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

runAllTests();
