# 安全中间件文档

## 概述

本目录包含中哈跨境服务平台的安全中间件，提供限流、错误处理和告警功能。

## 文件说明

### 1. rateLimiter.js - 限流中间件

基于 `express-rate-limit` 实现的防刷限流机制。

#### 限流器类型

| 限流器 | 限制规则 | 适用场景 |
|--------|---------|---------|
| `generalLimiter` | 15分钟内最多100次请求 | 全局API保护 |
| `aiLimiter` | 15分钟内最多20次调用 | AI问答接口 |
| `authLimiter` | 1小时内最多10次尝试 | 登录/注册接口 |
| `paymentLimiter` | 5分钟内最多5次操作 | 支付/退款接口 |

#### 使用方法

```javascript
const { aiLimiter } = require('./middleware/rateLimiter');

// 应用到特定路由
app.use('/api/ai', aiLimiter, require('./routes/ai'));

// 应用到多个路由
app.use('/api/leads', paymentLimiter, require('./routes/leads'));
```

#### 多语言错误消息

所有限流器都支持多语言错误消息：
- 中文 (zh)
- 俄语 (ru)  
- 哈萨克语 (kk)

根据请求头 `Accept-Language` 自动选择语言。

---

### 2. errorHandler.js - 错误处理中间件

全局错误处理和告警系统。

#### 主要功能

1. **统一错误响应格式**
   - 所有错误返回一致的 JSON 格式
   - 包含错误代码、消息、请求ID

2. **分类错误处理**
   - ValidationError → 400
   - CastError → 400
   - MongoServerSelectionError → 503
   - JsonWebTokenError → 401
   - 其他严重错误 → 500

3. **多语言错误消息**
   - 自动根据 `Accept-Language` 返回对应语言的错误消息

4. **告警通知**
   - 严重错误自动触发告警
   - 支持对接钉钉、企业微信、邮件等

#### 使用方法

```javascript
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');

// 放在所有路由之后
app.use(notFoundHandler);
app.use(errorHandler);
```

#### asyncHandler 包装器

```javascript
const { asyncHandler } = require('./middleware/errorHandler');

// 使用包装器处理异步错误
app.get('/api/example', asyncHandler(async (req, res) => {
  const data = await someAsyncOperation();
  res.json(data);
}));
```

---

## 告警配置

### 环境变量

在 `.env` 文件中添加以下配置：

```env
# 钉钉 Webhook（可选）
DINGTALK_WEBHOOK_URL=https://oapi.dingtalk.com/robot/send?access_token=xxx

# 企业微信 Webhook（可选）
WECHAT_WORK_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx

# 管理员邮箱（用于邮件告警）
ADMIN_EMAIL=admin@example.com

# PagerDuty（可选）
PAGERDUTY_ROUTING_KEY=xxx
```

### 对接钉钉

1. 在钉钉群中添加"自定义机器人"
2. 复制 Webhook URL
3. 在 `errorHandler.js` 中取消注释相关代码
4. 在 `.env` 中配置 `DINGTALK_WEBHOOK_URL`

### 对接企业微信

1. 在企业微信群中添加"群机器人"
2. 复制 Webhook URL
3. 在 `errorHandler.js` 中取消注释相关代码
4. 在 `.env` 中配置 `WECHAT_WORK_WEBHOOK_URL`

---

## 测试

### 测试限流

```bash
# 安装 artillery 进行压力测试
npm install -g artillery

# 测试 AI 接口限流
artillery quick --count 30 --num 50 http://localhost:3000/api/ai/ask
```

### 测试错误处理

```bash
# 触发 500 错误
curl http://localhost:3000/api/nonexistent

# 检查告警日志
tail -f logs/alarm_*.log
```

---

## 性能考虑

- 限流器使用内存存储，适用于单实例部署
- 多实例部署建议使用 Redis 存储：
  ```javascript
  const RedisStore = require('rate-limit-redis');
  
  const limiter = rateLimit({
    store: new RedisStore({
      // Redis 配置
    })
  });
  ```

---

## 监控建议

### Prometheus Metrics

可以添加以下指标：
- `rate_limit_exceeded_total` - 限流触发次数
- `error_handler_invoked_total` - 错误处理调用次数
- `alarm_triggered_total` - 告警触发次数

### 日志分析

定期分析 `logs/alarm_*.log`：
- 高频错误模式
- 攻击尝试检测
- 系统健康状况

---

## 最佳实践

1. **定期审查限流阈值**
   - 根据实际流量调整
   - 避免误伤正常用户

2. **监控告警质量**
   - 避免告警疲劳
   - 设置告警分级

3. **日志保留策略**
   - 保留最近 30 天
   - 压缩归档旧日志

4. **测试覆盖率**
   - 为限流规则编写测试
   - 测试错误处理分支

---

## 故障排查

### 问题：限流器不生效

检查：
1. 是否正确引入限流器
2. 中间件顺序是否正确
3. 是否有缓存绕过限流

### 问题：告警未发送

检查：
1. 环境变量是否配置
2. Webhook URL 是否正确
3. 网络连接是否正常

### 问题：错误未记录

检查：
1. `logs/` 目录权限
2. 磁盘空间是否充足
3. 日志文件是否被其他进程占用

---

## 更新日志

- **v1.0.0** (2024-01-15)
  - 初始版本
  - 支持多语言限流消息
  - 支持钉钉/企业微信告警
  - 支持日志文件存储
