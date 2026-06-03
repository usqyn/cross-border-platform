// 全局限流中间件 - 防刷限流
// 基于 express-rate-limit 实现

const rateLimit = require('express-rate-limit');
const { defaultKeyGenerator } = rateLimit;

// 通用API限流器（通用保护）
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 同一个IP最多100次请求
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      zh: '请求过于频繁，请稍后再试。',
      ru: 'Слишком много запросов, пожалуйста, попробуйте позже.',
      kk: 'Көп сұраныс, кейінірек қайталап көріңіз.',
      retryAfter: '15分钟'
    }
  },
  standardHeaders: true, // 返回标准的 RateLimit-* 头
  legacyHeaders: false, // 禁用 X-RateLimit-* 头
  keyGenerator: defaultKeyGenerator,
  skip: (req) => {
    // 跳过健康检查等特定路径
    return req.path === '/health' || req.path === '/ping';
  },
  handler: (req, res, next, options) => {
    // 自定义错误响应格式
    const lang = req.headers['accept-language'] || 'zh';
    
    const errorMessages = {
      zh: '请求过于频繁，请稍后再试。',
      ru: 'Слишком много запросов, пожалуйста, попробуйте позже.',
      kk: 'Көп сұраныс, кейінірек қайталап көріңіз.'
    };
    
    const message = errorMessages[lang] || errorMessages.zh;
    
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: message,
        retryAfter: options.windowMs / 1000 + '秒'
      }
    });
  }
});

// AI问答接口专用限流器（更严格的保护）
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 20, // 同一个IP最多20次AI问答
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      zh: 'AI问答请求过于频繁，请15分钟后再试。',
      ru: 'Слишком много запросов к ИИ, пожалуйста, попробуйте через 15 минут.',
      kk: 'ЖИ сұраныстары өте жиі, 15 минуттан кейін қайталап көріңіз.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: defaultKeyGenerator,
  handler: (req, res, next, options) => {
    const lang = req.headers['accept-language'] || 'zh';
    
    const errorMessages = {
      zh: 'AI问答请求过于频繁，请15分钟后再试。当前您已用完本时段的AI问答配额。',
      ru: 'Слишком много запросов к ИИ, пожалуйста, попробуйте через 15 минут. Ваша квота на этот период исчерпана.',
      kk: 'ЖИ сұраныстары өте жиі, 15 минуттан кейін қайталап көріңіз. Сіздің осы кезеңдегі ЖИ пайдалану квотасы толысты.'
    };
    
    const message = errorMessages[lang] || errorMessages.zh;
    
    res.status(429).json({
      success: false,
      error: {
        code: 'AI_RATE_LIMIT_EXCEEDED',
        message: message,
        quota: {
          limit: 20,
          window: '15分钟',
          retryAfterSeconds: Math.ceil(options.windowMs / 1000)
        }
      }
    });
  },
  skip: (req) => {
    // 跳过 OPTIONS 预检请求
    return req.method === 'OPTIONS';
  }
});

// 用户认证接口限流器（防止暴力破解）
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 10, // 同一个IP最多10次登录尝试
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      zh: '登录尝试次数过多，请1小时后再试。',
      ru: 'Слишком много попыток входа, пожалуйста, попробуйте через час.',
      kk: 'Кіру әрекеттері өте көп, бір сағаттан кейін қайталап көріңіз.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: defaultKeyGenerator,
  handler: (req, res, next, options) => {
    const lang = req.headers['accept-language'] || 'zh';
    
    const errorMessages = {
      zh: '登录尝试次数过多，请1小时后再试。您的账号可能存在安全风险，建议检查。',
      ru: 'Слишком много попыток входа, пожалуйста, попробуйте через час. Ваша учетная запись может быть под угрозой.',
      kk: 'Кіру әрекеттері өте көп, бір сағаттан кейін қайталап көріңіз. Сіздің аккаунтыңыз қауіпсіздік үшін тексерілуі керек.'
    };
    
    const message = errorMessages[lang] || errorMessages.zh;
    
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: message,
        securityTip: '如果这不是您本人的操作，请忽略此警告并定期更换密码。'
      }
    });
  }
});

// 退款/支付接口限流器（金融安全）
const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分钟
  max: 5, // 同一个IP最多5次支付相关操作
  message: {
    success: false,
    error: {
      code: 'PAYMENT_RATE_LIMIT_EXCEEDED',
      zh: '支付操作过于频繁，请稍后再试。',
      ru: 'Платежные операции слишком часты, пожалуйста, попробуйте позже.',
      kk: 'Төлем операциялары өте жиі, кейінірек қайталап көріңіз.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: defaultKeyGenerator,
  handler: (req, res, next, options) => {
    const lang = req.headers['accept-language'] || 'zh';
    
    const errorMessages = {
      zh: '支付操作过于频繁，为保护您的账户安全，请5分钟后再试。',
      ru: 'Платежные операции слишком часты. Для защиты вашего аккаунта, пожалуйста, попробуйте через 5 минут.',
      kk: 'Төлем операциялары өте жиі. Сіздің аккаунтыңызды қорғау үшін 5 минуттан кейін қайталап көріңіз.'
    };
    
    const message = errorMessages[lang] || errorMessages.zh;
    
    res.status(429).json({
      success: false,
      error: {
        code: 'PAYMENT_RATE_LIMIT_EXCEEDED',
        message: message,
        security: '账户安全保护已激活'
      }
    });
  }
});

module.exports = {
  generalLimiter,
  aiLimiter,
  authLimiter,
  paymentLimiter
};
