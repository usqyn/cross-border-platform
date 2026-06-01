# 中哈跨境服务平台

一个面向中国与哈萨克斯坦之间的跨境服务平台，包含微信小程序前端和Node.js后端。

## 功能特性

- 🌐 多语言支持（中文、俄语、哈萨克语）
- 🤖 AI智能问答（基于知识库的RAG）
- 🏢 中介服务聚合与展示
- ⭐ 评分与评论系统
- 📱 现代化小程序界面

## 高级优化模块

### 1. 跨境业务「多语言即时翻译桥梁」
- **解决痛点**: 中国客户与哈萨克斯坦中介语言不通的问题
- **实现功能**:
  - 自动双向翻译（中文 ↔ 俄语 ↔ 哈萨克语）
  - 消息同时存储原文和翻译内容
  - Mock翻译函数预留接口，便于接入真实大模型API
- **技术实现**: `/backend/utils/translator.js`

### 2. 基于时区与口岸状态的「动态公告/延迟提示」
- **解决痛点**: 时区差异导致用户在非工作时间频繁催促
- **实现功能**:
  - 自动计算哈萨克斯坦当地时间（比北京时间慢3小时）
  - 非工作时间显示友好提示
  - 口岸动态实时展示（霍尔果斯、阿拉山口、巴克图等）
- **技术实现**: `/miniprogram/utils/timezone.js`, `/backend/models/BorderStatus.js`

### 3. 中介等级信用分与「好评权重」算法
- **解决痛点**: 防止刷单和虚假好评
- **实现功能**:
  - 信用分系统（初始100分）
  - 动态权重计算：担保交易好评1.5倍，线索解锁好评1.0倍
  - 中介全责纠纷直接扣除20分信用分
  - 中介列表按权重分数降序排列
- **技术实现**: `/backend/controllers/intermediaryController.js`

## 技术栈

### 后端
- Node.js + Express
- MongoDB + Mongoose

### 前端
- 微信小程序原生开发

## 快速开始

### 1. 环境准备

确保已安装：
- Node.js (v14+)
- MongoDB (或使用本地MongoDB)

### 2. 后端启动

```bash
cd backend

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env
# 编辑 .env 配置你的数据库连接

# 启动MongoDB（如需要）
# mongod

# 初始化Mock数据
npm run seed

# 启动开发服务器
npm run dev
```

后端服务将在 http://localhost:3000 启动

### 3. 小程序配置

1. 打开微信开发者工具
2. 导入项目，选择 `miniprogram` 目录
3. 在 `miniprogram/app.js` 中确认 `baseUrl` 配置正确
4. 点击编译运行

## Mock数据说明

运行 `npm run seed` 会自动创建：

- 2个测试用户
- 2条知识库内容（自驾备案、购房政策）
- 3家中介服务商（带信用分和权重分）
- 3条评论数据
- 6条需求线索（包含不同状态）
- 3条支付记录
- 3个口岸状态（霍尔果斯、阿拉山口、巴克图）

## 快速演示

### 运行高级功能演示
```bash
cd backend
node demo.js
```

### 查看翻译功能测试
系统内置了多语言翻译桥梁，支持：
- 中文 → 俄语/哈萨克语
- 俄语 → 中文/哈萨克语
- 哈萨克语 → 中文/俄语

## 目录结构

```
.
├── backend/              # 后端服务
│   ├── models/          # 数据模型
│   ├── controllers/     # 控制器
│   ├── routes/          # 路由
│   ├── config/          # 配置
│   └── scripts/         # 脚本
└── miniprogram/         # 小程序前端
    ├── pages/           # 页面
    └── utils/           # 工具函数
```

## API接口

### AI问答
- POST `/api/ai/ask` - 提问并获取相关中介推荐

### 中介服务
- GET `/api/intermediaries` - 获取中介列表
- GET `/api/intermediaries/:id` - 获取中介详情

### 评论
- POST `/api/reviews` - 添加评论
- GET `/api/reviews` - 获取评论列表

## 数据模型

- User - 用户信息
- Intermediary - 中介信息
- Review - 评论数据
- KnowledgeBase - 知识库内容
