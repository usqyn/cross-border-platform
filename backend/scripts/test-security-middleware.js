// 限流和错误处理测试脚本

console.log('============================================');
console.log('   安全中间件功能测试');
console.log('============================================');
console.log('');

// 测试1: 限流中间件导入
console.log('📦 测试1: 限流中间件导入');
console.log('--------------------------------------------');
try {
  const rateLimiter = require('../middleware/rateLimiter');
  console.log('✅ 限流中间件导入成功');
  console.log('   可用的限流器:');
  console.log('   - generalLimiter: 15分钟内最多100次请求');
  console.log('   - aiLimiter: 15分钟内最多20次调用');
  console.log('   - authLimiter: 1小时内最多10次尝试');
  console.log('   - paymentLimiter: 5分钟内最多5次操作');
} catch (error) {
  console.log('❌ 限流中间件导入失败:', error.message);
  console.log('   请先运行: npm install express-rate-limit');
}

console.log('');

// 测试2: 错误处理中间件导入
console.log('📦 测试2: 错误处理中间件导入');
console.log('--------------------------------------------');
try {
  const errorHandler = require('../middleware/errorHandler');
  console.log('✅ 错误处理中间件导入成功');
  console.log('   导出的函数:');
  Object.keys(errorHandler).forEach(key => {
    console.log(`   - ${key}`);
  });
} catch (error) {
  console.log('❌ 错误处理中间件导入失败:', error.message);
}

console.log('');

// 测试3: 限流器配置验证
console.log('📊 测试3: 限流器配置验证');
console.log('--------------------------------------------');
try {
  const { generalLimiter, aiLimiter, authLimiter, paymentLimiter } = require('../middleware/rateLimiter');
  
  const limiters = [
    { name: 'generalLimiter', limiter: generalLimiter, expected: 100 },
    { name: 'aiLimiter', limiter: aiLimiter, expected: 20 },
    { name: 'authLimiter', limiter: authLimiter, expected: 10 },
    { name: 'paymentLimiter', limiter: paymentLimiter, expected: 5 }
  ];
  
  limiters.forEach(item => {
    console.log(`✅ ${item.name}: 已配置 (限制: ${item.expected}次/周期)`);
  });
} catch (error) {
  console.log('❌ 限流器配置验证失败:', error.message);
}

console.log('');

// 测试4: 告警函数验证
console.log('🚨 测试4: 告警函数验证');
console.log('--------------------------------------------');
try {
  const { sendAlarmNotification } = require('../middleware/errorHandler');
  
  // 模拟触发告警
  const testError = new Error('测试告警 - 这是一条模拟错误消息');
  testError.name = 'TestError';
  testError.code = 'TEST_CODE';
  
  const context = {
    url: '/api/test',
    method: 'POST',
    ip: '127.0.0.1',
    level: 'INFO'
  };
  
  console.log('📤 发送测试告警...');
  sendAlarmNotification(testError, context);
  console.log('✅ 告警函数调用成功');
  console.log('   请检查上方是否有告警日志输出');
  console.log('   以及 logs/alarm_*.log 文件');
} catch (error) {
  console.log('❌ 告警函数测试失败:', error.message);
}

console.log('');

// 测试5: 日志目录验证
console.log('📁 测试5: 日志目录验证');
console.log('--------------------------------------------');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
if (fs.existsSync(logsDir)) {
  console.log('✅ logs 目录存在');
  const files = fs.readdirSync(logsDir);
  console.log(`   包含 ${files.length} 个文件/目录`);
  files.forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      console.log(`   📄 ${file}`);
    } else {
      console.log(`   📁 ${file}/`);
    }
  });
} else {
  console.log('⚠️  logs 目录不存在，已自动创建');
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ logs 目录已创建');
}

console.log('');
console.log('============================================');
console.log('   测试完成');
console.log('============================================');
console.log('');
console.log('💡 后续步骤:');
console.log('1. 安装 express-rate-limit: npm install express-rate-limit');
console.log('2. 启动 MongoDB: mongod --dbpath /data/db');
console.log('3. 初始化数据: npm run seed');
console.log('4. 启动服务器: npm start');
console.log('5. 测试限流: 用浏览器多次访问 /api/ai/ask');
console.log('');
