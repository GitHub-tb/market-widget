# 桌面实时证券市场行情显示挂件程序

## 项目概述

本项目是一个桌面实时证券市场行情显示挂件程序，旨在为用户提供便捷的股票、基金、期货等金融产品的实时行情监控功能。程序采用现代化UI设计，支持多窗口显示，可自定义布局，为用户提供专业的投资决策支持。

## 功能特性

### 核心功能
- **实时行情显示**: 支持股票、基金、期货、外汇等金融产品的实时价格、涨跌幅、成交量等数据
- **多市场支持**: 支持A股、港股、美股、期货、外汇等多个市场
- **自定义挂件**: 支持创建多个独立的行情显示窗口，可自由调整位置和大小
- **技术指标**: 集成常用技术指标（MA、MACD、KDJ、RSI等）
- **K线图表**: 支持分时图、日K、周K、月K等多种时间周期
- **预警功能**: 支持价格预警、涨跌幅预警、成交量预警等

### 高级功能
- **数据导出**: 支持历史数据导出为CSV、Excel格式
- **新闻资讯**: 集成财经新闻、公告信息等
- **投资组合**: 支持自选股管理、投资组合跟踪
- **数据回测**: 支持历史数据回测分析
- **多语言支持**: 支持中文、英文等多语言界面

## 技术架构

### 前端技术栈
- **框架**: Electron + React/Vue.js
- **UI组件库**: Ant Design / Element Plus
- **图表库**: ECharts / TradingView
- **状态管理**: Redux / Vuex
- **样式**: CSS3 + Less/Sass

### 后端技术栈
- **数据源**: 多数据源集成（新浪财经、东方财富、Yahoo Finance等）
- **数据存储**: SQLite / PostgreSQL
- **缓存**: Redis
- **消息推送**: WebSocket
- **定时任务**: Node-cron

### 开发工具
- **构建工具**: Webpack / Vite
- **包管理**: npm / yarn
- **代码规范**: ESLint + Prettier
- **版本控制**: Git
- **测试框架**: Jest + Cypress

## 项目结构

```
market-widget/
├── src/
│   ├── main/                 # Electron主进程
│   │   ├── index.js         # 主进程入口
│   │   ├── ipc/             # IPC通信处理
│   │   └── services/        # 系统服务
│   ├── renderer/            # 渲染进程
│   │   ├── components/      # React/Vue组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── utils/          # 工具函数
│   │   └── styles/         # 样式文件
│   ├── shared/             # 共享代码
│   │   ├── constants/      # 常量定义
│   │   ├── types/          # TypeScript类型
│   │   └── utils/          # 共享工具
│   └── assets/             # 静态资源
├── public/                 # 公共资源
├── dist/                   # 构建输出
├── docs/                   # 文档
├── tests/                  # 测试文件
├── package.json
├── electron-builder.json
└── README.md
```

## 安装与运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- Windows 10+ / macOS 10.14+ / Ubuntu 18.04+

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/market-widget.git
cd market-widget
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **开发模式运行**
```bash
npm run dev
# 或
yarn dev
```

4. **构建应用**
```bash
npm run build
# 或
yarn build
```

## 配置说明

### 数据源配置
```json
{
  "dataSources": {
    "sina": {
      "enabled": true,
      "baseUrl": "https://hq.sinajs.cn",
      "timeout": 5000
    },
    "eastmoney": {
      "enabled": true,
      "baseUrl": "https://push2.eastmoney.com",
      "timeout": 5000
    }
  }
}
```

### 界面配置
```json
{
  "ui": {
    "theme": "dark",
    "language": "zh-CN",
    "autoHide": true,
    "alwaysOnTop": false,
    "opacity": 0.9
  }
}
```

## API接口

### 行情数据接口
- `GET /api/quote/:symbol` - 获取单个股票行情
- `GET /api/quotes` - 批量获取股票行情
- `GET /api/kline/:symbol` - 获取K线数据
- `GET /api/indicator/:symbol` - 获取技术指标

### 用户数据接口
- `POST /api/watchlist` - 添加自选股
- `DELETE /api/watchlist/:symbol` - 删除自选股
- `GET /api/watchlist` - 获取自选股列表

## 开发指南

### 添加新的数据源
1. 在 `src/shared/services/` 目录下创建新的数据源类
2. 实现 `IDataSource` 接口
3. 在配置文件中启用新数据源
4. 更新数据源管理器

### 创建新的挂件组件
1. 在 `src/renderer/components/widgets/` 目录下创建组件
2. 继承基础挂件类或实现挂件接口
3. 注册到挂件管理器
4. 添加相应的配置选项

### 自定义主题
1. 在 `src/renderer/styles/themes/` 目录下创建主题文件
2. 定义CSS变量
3. 在主题管理器中注册新主题
4. 更新主题切换功能

## 测试

### 单元测试
```bash
npm run test
```

### 集成测试
```bash
npm run test:integration
```

### E2E测试
```bash
npm run test:e2e
```

## 部署

### 打包配置
```json
{
  "appId": "com.market.widget",
  "productName": "Market Widget",
  "directories": {
    "output": "dist"
  },
  "files": [
    "dist/**/*",
    "node_modules/**/*"
  ],
  "win": {
    "target": "nsis"
  },
  "mac": {
    "target": "dmg"
  },
  "linux": {
    "target": "AppImage"
  }
}
```

### 发布流程
1. 更新版本号
2. 运行测试
3. 构建应用
4. 打包发布
5. 上传到发布平台

## 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request
5. 代码审查
6. 合并代码

### 代码规范
- 使用 TypeScript 进行开发
- 遵循 ESLint 规则
- 编写单元测试
- 添加适当的注释
- 保持代码简洁

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 联系方式

- 项目主页: https://github.com/your-username/market-widget
- 问题反馈: https://github.com/your-username/market-widget/issues
- 邮箱: your-email@example.com

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持基础行情显示
- 支持多窗口挂件
- 集成常用技术指标

### v0.9.0 (2023-12-15)
- Beta版本发布
- 完成核心功能开发
- 进行用户测试

---

**注意**: 本项目仅供学习和研究使用，不构成投资建议。投资有风险，入市需谨慎。 