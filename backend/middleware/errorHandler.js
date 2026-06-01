// 全局错误处理中间件 - 错误监控与告警
// 负责捕获所有未处理的错误，并触发告警通知

const fs = require('fs');
const path = require('path');

// ============================================
// 告警通知函数 - 预留接口供未来扩展
// ============================================

/**
 * 发送告警通知
 * 
 * 【未来对接方案 - 选择以下任一方式实现】：
 * 
 * 1. 钉钉 Webhook（推荐）
 *    - 注册钉钉群 → 添加机器人 → 获取 Webhook URL
 *    - 参考文档: https://developers.dingtalk.com/document/app/custom-robot-access
 * 
 * 2. 企业微信 Webhook
 *    - 注册企业微信群 → 添加机器人 → 获取 Webhook URL
 *    - 参考文档: https://developer.work.weixin.qq.com/document/path/91770
 * 
 * 3. 邮件告警（SendGrid / 阿里云邮件）
 *    - 配置 SMTP 服务
 *    - 支持附件和富文本
 * 
 * 4. 短信告警（阿里云 / 腾讯云）
 *    - 适用于紧急故障
 * 
 * 5. 专业监控平台（PagerDuty / OpsGenie）
 *    - 支持分派、升级、响应工作流
 */

async function sendAlarmNotification(error, context = {}) {
  const timestamp = new Date().toISOString();
  
  // 构建告警消息
  const alarmMessage = {
    level: context.level || 'ERROR',
    timestamp,
    service: '中哈跨境服务平台',
    environment: process.env.NODE_ENV || 'development',
    error: {
      name: error.name || 'UnknownError',
      message: error.message || '未知错误',
      stack: error.stack || '',
      code: error.code || 'INTERNAL_ERROR'
    },
    context: {
      url: context.url || '',
      method: context.method || '',
      ip: context.ip || '',
      userId: context.userId || 'anonymous',
      requestId: context.requestId || generateRequestId()
    },
    metadata: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  };

  // 控制台输出（开发环境）
  console.error('='.repeat(80));
  console.error(`🚨 【${alarmMessage.level} 告警】 - ${timestamp}`);
  console.error('='.repeat(80));
  console.error('服务:', alarmMessage.service);
  console.error('环境:', alarmMessage.environment);
  console.error('错误:', alarmMessage.error.name);
  console.error('消息:', alarmMessage.error.message);
  console.error('请求:', `${alarmMessage.context.method} ${alarmMessage.context.url}`);
  console.error('IP:', alarmMessage.context.ip);
  console.error('请求ID:', alarmMessage.context.requestId);
  console.error('堆栈:', alarmMessage.error.stack.substring(0, 500));
  console.error('='.repeat(80));

  // ============================================
  // 【未来实现】对接告警渠道
  // ============================================
  
  try {
    // 方案1: 钉钉 Webhook（取消注释并配置即可启用）
    /*
    const dingtalkWebhook = process.env.DINGTALK_WEBHOOK_URL;
    if (dingtalkWebhook) {
      await sendDingTalkAlert(dingtalkWebhook, alarmMessage);
    }
    */

    // 方案2: 企业微信 Webhook（取消注释并配置即可启用）
    /*
    const wechatWebhook = process.env.WECHAT_WORK_WEBHOOK_URL;
    if (wechatWebhook) {
      await sendWechatWorkAlert(wechatWebhook, alarmMessage);
    }
    */

    // 方案3: 发送邮件告警（取消注释并配置 SMTP）
    /*
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmailAlert(adminEmail, alarmMessage);
    }
    */

    // 方案4: PagerDuty / OpsGenie（取消注释并配置 API Key）
    /*
    const pagerdutyKey = process.env.PAGERDUTY_ROUTING_KEY;
    if (pagerdutyKey) {
      await sendPagerDutyAlert(pagerdutyKey, alarmMessage);
    }
    */

    // 方案5: 写入本地告警日志文件
    writeAlarmLog(alarmMessage);

    console.log('✅ 告警通知已发送');
  } catch (notificationError) {
    // 告警系统自身的错误不应该影响主流程
    console.error('❌ 发送告警通知失败:', notificationError.message);
  }
}

/**
 * 生成唯一请求ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * 写入告警日志到文件
 */
function writeAlarmLog(alarmMessage) {
  try {
    const logDir = path.join(__dirname, '../logs');
    
    // 确保日志目录存在
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, `alarm_${new Date().toISOString().split('T')[0]}.log`);
    const logEntry = JSON.stringify(alarmMessage) + '\n';
    
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.error('写入告警日志失败:', error.message);
  }
}

// ============================================
// 【未来实现示例】钉钉 Webhook
// ============================================

/*
async function sendDingTalkAlert(webhookUrl, alarmMessage) {
  const axios = require('axios');
  
  const text = `
🚨 【${alarmMessage.level}告警】
服务: ${alarmMessage.service}
环境: ${alarmMessage.environment}
错误: ${alarmMessage.error.name}
消息: ${alarmMessage.error.message}
请求: ${alarmMessage.context.method} ${alarmMessage.context.url}
时间: ${alarmMessage.timestamp}
请求ID: ${alarmMessage.context.requestId}
  `.trim();

  await axios.post(webhookUrl, {
    msgtype: 'text',
    text: {
      content: text
    }
  });
}
*/

// ============================================
// 【未来实现示例】企业微信 Webhook
// ============================================

/*
async function sendWechatWorkAlert(webhookUrl, alarmMessage) {
  const axios = require('axios');
  
  const content = `
🚨 【${alarmMessage.level}告警】
服务: ${alarmMessage.service}
环境: ${alarmMessage.environment}
错误: ${alarmMessage.error.name}
消息: ${alarmMessage.error.message}
请求: ${alarmMessage.context.method} ${alarmMessage.context.url}
时间: ${alarmMessage.timestamp}
  `.trim();

  await axios.post(webhookUrl, {
    msgtype: 'markdown',
    markdown: {
      content: content
    }
  });
}
*/

// ============================================
// 全局错误处理中间件
// ============================================

function errorHandler(err, req, res, next) {
  // 生成请求ID用于追踪
  const requestId = req.headers['x-request-id'] || generateRequestId();
  
  // 构建错误上下文
  const context = {
    requestId,
    url: req.originalUrl || req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user ? req.user._id : 'anonymous',
    level: determineErrorLevel(err)
  };

  // 判断是否为严重错误（需要立即告警）
  const isSevereError = isSevereErrorType(err);
  
  // 1. 严重错误 - 立即触发告警
  if (isSevereError) {
    sendAlarmNotification(err, context);
  }

  // 2. 记录错误日志
  console.error(`[${requestId}] Error occurred:`, {
    name: err.name,
    message: err.message,
    code: err.code,
    path: req.path,
    stack: err.stack
  });

  // 3. 根据错误类型返回合适的响应
  if (err.name === 'ValidationError') {
    // 数据验证错误 - 400
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '数据验证失败，请检查输入。',
        details: err.message
      },
      requestId
    });
  }

  if (err.name === 'CastError' || err.code === 'INVALID_ID') {
    // 无效的 MongoDB ObjectId - 400
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: '无效的ID格式，请检查输入。',
        ru: 'Неверный формат ID, пожалуйста, проверьте ввод.',
        kk: 'Жарамсыз ID форматы, енгізуді тексеріңіз.'
      },
      requestId
    });
  }

  if (err.name === 'MongoServerSelectionError' || err.name === 'MongooseServerSelectionError') {
    // 数据库连接错误 - 503
    sendAlarmNotification(err, { ...context, level: 'CRITICAL' });
    return res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: '数据库服务暂时不可用，请稍后再试。',
        ru: 'Сервис базы данных временно недоступен, пожалуйста, попробуйте позже.',
        kk: 'Дерекқор қызметі уақытша қол жетімді емес, кейінірек қайталап көріңіз.'
      },
      requestId
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    // 重复数据错误 - 409
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: '数据已存在，请勿重复提交。',
        ru: 'Данные уже существуют, пожалуйста, не отправляйте повторно.',
        kk: 'Деректер бар, қайта жібермеңіз.'
      },
      requestId
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // JWT 认证错误 - 401
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: '认证失败，请重新登录。',
        ru: 'Ошибка аутентификации, пожалуйста, войдите снова.',
        kk: 'Аутентификация қатесі, қайтадан кіріңіз.'
      },
      requestId
    });
  }

  if (err.name === 'UnauthorizedError') {
    // 权限不足 - 403
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: '权限不足，无法执行此操作。',
        ru: 'Недостаточно прав для выполнения этой операции.',
        kk: 'Бұл операцияны орындауға құқығыңыз жеткіліксіз.'
      },
      requestId
    });
  }

  if (err.status === 404 || err.name === 'NotFoundError') {
    // 资源不存在 - 404
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '请求的资源不存在。',
        ru: 'Запрашиваемый ресурс не найден.',
        kk: 'Сұралған ресурс табылмады.'
      },
      requestId
    });
  }

  // 默认错误处理 - 500
  if (err.status >= 500 || !err.status) {
    // 服务器内部错误 - 即使我们已经处理了某些错误，也要记录严重错误
    if (isSevereError) {
      sendAlarmNotification(err, { ...context, level: 'CRITICAL' });
    }
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误，请稍后再试或联系管理员。',
        ru: 'Внутренняя ошибка сервера, пожалуйста, попробуйте позже или свяжитесь с администратором.',
        kk: 'Сервердің ішкі қатесі, кейінірек қайталап көріңіз немесе әкімшімен байланысыңыз.'
      },
      requestId
    });
  }

  // 其他错误 - 直接返回错误状态
  res.status(err.status).json({
    success: false,
    error: {
      code: err.code || 'UNKNOWN_ERROR',
      message: err.message || '发生未知错误'
    },
    requestId
  });
}

/**
 * 判断错误严重级别
 */
function determineErrorLevel(err) {
  if (err.name === 'MongoServerSelectionError') return 'CRITICAL';
  if (err.name === 'MongooseServerSelectionError') return 'CRITICAL';
  if (err.code === 'INSUFFICIENT_FUNDS') return 'HIGH';
  if (err.message && err.message.includes('Transaction')) return 'HIGH';
  if (err.message && err.message.includes('Payment')) return 'HIGH';
  if (err.name === 'CastError') return 'MEDIUM';
  if (err.name === 'ValidationError') return 'LOW';
  return 'MEDIUM';
}

/**
 * 判断是否为严重错误类型
 */
function isSevereErrorType(err) {
  const severeErrorPatterns = [
    /database/i,
    /connection/i,
    /transaction/i,
    /payment/i,
    /wallet/i,
    /escrow/i,
    /refund/i,
    /MongoServerError/i,
    /MongooseServerSelectionError/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i
  ];

  return severeErrorPatterns.some(pattern => 
    pattern.test(err.message) || 
    pattern.test(err.name) || 
    pattern.test(err.code)
  );
}

/**
 * 404 未找到中间件
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `路由 ${req.method} ${req.path} 不存在`,
      ru: `Маршрут ${req.method} ${req.path} не найден`,
      kk: `Маршрут ${req.method} ${req.path} табылмады`
    }
  });
}

/**
 * 异步错误处理包装器
 * 使用方法: router.get('/path', asyncHandler(async (req, res) => {...}))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  sendAlarmNotification
};
