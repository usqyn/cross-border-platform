require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { generalLimiter, aiLimiter, authLimiter, paymentLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// 数据库连接
connectDB();

// CORS 配置
app.use(cors());

// 请求体解析
app.use(express.json());

// 健康检查接口（不受限流限制）
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 全局限流中间件 - 保护所有API
app.use(generalLimiter);

// API 路由配置
app.use('/api/ai', aiLimiter, require('./routes/ai'));
app.use('/api/intermediaries', require('./routes/intermediaries'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/leads', paymentLimiter, require('./routes/leads'));
app.use('/api/wallet', paymentLimiter, require('./routes/wallet'));
app.use('/api/payments', paymentLimiter, require('./routes/payments'));
app.use('/api/refund', paymentLimiter, require('./routes/refund'));
app.use('/api/dispute', paymentLimiter, require('./routes/dispute'));
app.use('/api/messages', require('./routes/messages'));

// 认证相关接口（更严格的限流）
app.use('/api/auth', authLimiter, require('./routes/auth'));

// 404 处理
app.use(notFoundHandler);

// 全局错误处理中间件（必须放在最后）
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('===========================================');
  console.log('   中哈跨境服务平台 - 后端服务启动');
  console.log('===========================================');
  console.log(`✅ 服务器运行在端口: ${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('===========================================');
  console.log('');
  console.log('🔒 安全配置:');
  console.log('   ✅ 全局限流: 15分钟内最多100次请求');
  console.log('   ✅ AI接口限流: 15分钟内最多20次调用');
  console.log('   ✅ 支付接口限流: 5分钟内最多5次操作');
  console.log('   ✅ 错误监控: 已启用');
  console.log('   ✅ 告警系统: 已就绪');
  console.log('');
});
