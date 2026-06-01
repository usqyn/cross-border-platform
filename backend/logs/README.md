# 告警日志目录

此目录用于存储系统告警日志文件。

每天的告警日志会自动保存为 `alarm_YYYY-MM-DD.log` 格式。

## 日志格式

每行一个 JSON 对象，包含以下字段：
- level: 告警级别（ERROR / CRITICAL / HIGH / MEDIUM / LOW）
- timestamp: 时间戳
- service: 服务名称
- error: 错误信息
- context: 请求上下文
- metadata: 系统元数据

## 自动清理建议

建议配置 logrotate 或定时任务自动清理旧日志：
- 保留最近 30 天的日志
- 或当日志文件超过 100MB 时压缩归档

## 告警示例

```json
{
  "level": "CRITICAL",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "中哈跨境服务平台",
  "error": {
    "name": "MongoServerSelectionError",
    "message": "Failed to connect to MongoDB",
    "stack": "..."
  }
}
```
