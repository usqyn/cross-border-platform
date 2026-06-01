// 中哈跨境服务平台 - 高级功能演示

console.log('============================================');
console.log('   中哈跨境服务平台 - 高级功能演示');
console.log('============================================');
console.log('\n');

// 1. 演示多语言翻译功能
console.log('📚 1. 多语言即时翻译功能演示');
console.log('--------------------------------------------');

const translator = require('./utils/translator');
const testMessages = [
  { from: 'zh', text: '我想办理自驾备案，车是坦克300' },
  { from: 'ru', text: 'Здравствуйте, я хочу оформить визу' },
  { from: 'kk', text: 'Сәлеметсіз бе, мен көлік тіркеуін жасамқысы келеді' }
];

testMessages.forEach(msg => {
  const translations = translator.translateToAllLanguages(msg.text, msg.from);
  console.log(`原文 (${msg.from}): ${msg.text}`);
  console.log('翻译结果:');
  Object.entries(translations).forEach(([lang, text]) => {
    console.log(`  ${lang}: ${text}`);
  });
  console.log('');
});

// 2. 演示权重计算逻辑
console.log('⚖️ 2. 中介信用分与权重计算算法');
console.log('--------------------------------------------');
console.log('信用分计算规则:');
console.log('- 初始信用分: 100分');
console.log('- 担保交易好评权重: 1.5倍');
console.log('- 线索解锁好评权重: 1.0倍');
console.log('- 中介全责纠纷: -20分');
console.log('');

// 3. 时区转换演示
console.log('🕐 3. 时区转换与口岸状态');
console.log('--------------------------------------------');
console.log('哈萨克斯坦时区: 比北京时间慢3小时');
console.log('工作时间: 周一至周五 09:00-18:00');
console.log('非工作时间显示提示信息');
console.log('');

console.log('============================================');
console.log('   系统已准备就绪!');
console.log('============================================');
console.log('\n启动服务命令: npm start');
console.log('初始化数据命令: npm run seed');
console.log('');
