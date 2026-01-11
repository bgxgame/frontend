# 项目总结

## 1. 项目概述
这是一个基于Vue 3 + TypeScript + Vite构建的前端项目，名为LifePlan，是一个个人计划管理系统。项目采用了Tailwind CSS作为样式框架，UI设计参考了Linear应用的风格，具有现代、简洁的界面。

## 2. 技术栈
- **前端框架**: Vue 3 (使用Composition API)
- **编程语言**: TypeScript 5.9+
- **构建工具**: Vite 7.2
- **样式方案**: Tailwind CSS 3.4 + PostCSS + Autoprefixer
- **核心依赖**: 
  - `Axios`: API请求处理
  - `date-fns`: 日期处理
  - `@heroicons/vue`: 图标库
  - `vuedraggable`: 拖拽功能支持
  - `marked`: Markdown解析

## 3. 项目架构与设计特点

### 架构特点:
- **组件化设计**: 采用高度模块化的组件设计（如LoginModal, PlanList等）
- **TypeScript类型安全**: 全面使用TypeScript确保类型安全
- **响应式布局**: 适配多端设备的响应式设计
- **Linear风格UI**: 极简主义 + 柔和蓝调色 + 精致动效

### 代码组织:
- 功能模块集中在`src/components/`目录下
- 项目入口文件为`src/App.vue`
- API请求封装在`src/api.ts`
- 类型定义位于`src/types.ts`

## 4. 主要功能模块

### 用户认证系统:
- 管理员登录/注册功能
- 基于Token的身份验证
- 无感Token刷新机制（包含Access Token和Refresh Token）

### 项目管理:
- 项目列表展示
- 创建新项目
- 编辑/删除现有项目
- 项目状态管理（active, completed, backlog, paused, canceled）

### 任务管理:
- 任务列表展示
- 创建/编辑任务
- 任务状态管理（backlog, todo, in_progress, done, canceled）
- 优先级设置（0-4级）
- 截止日期管理
- 任务拖拽排序（看板模式）

### 交互功能:
- 全局搜索功能（支持项目和任务混合搜索）
- 两种视图模式（列表模式和看板模式）
- 拖拽功能（支持任务在不同状态间拖拽）
- Toast消息提示系统

## 5. API设计与后端集成
- API基础URL: `http://127.0.0.1:3000/api`
- 包含完整的CRUD操作（创建、读取、更新、删除）
- 采用RESTful API设计
- 包含复杂的无感刷新逻辑处理认证问题

## 6. 核心组件分析

### App.vue (主应用组件):
- 控制登录/登出状态
- 负责路由导航和状态管理
- 集成全局搜索功能
- 管理主要页面组件

### AuthPage.vue (认证组件):
- 提供登录/注册界面
- 实现表单验证
- 处理认证流程

### ProjectList.vue (项目列表组件):
- 展示项目网格
- 支持项目创建和删除
- 提供项目选择功能

### IssueList.vue (任务列表组件):
- 提供列表和看板两种视图
- 支持任务拖拽排序
- 实现任务状态管理

## 7. 特殊功能亮点

### 无感Token刷新机制:
- 自动检测401错误
- 队列管理待处理请求
- 自动刷新Token并重新发送请求

### 拖拽功能:
- 使用vuedraggable实现任务拖拽
- 在不同状态列之间移动任务
- 实时更新后端数据

### 全局搜索:
- 支持项目和任务混合搜索
- 快捷键支持（Tab+Tab或Ctrl+K）

### 响应式设计:
- 适配不同屏幕尺寸
- 移动端友好的界面设计

## 8. 开发配置
- **开发服务器**: `npm run dev`
- **构建生产版本**: `npm run build`
- **预览生产版本**: `npm run preview`

## 9. UI设计特色
- **极简主义**: 大量使用留白，界面清爽
- **柔和配色**: 使用柔和的蓝色作为主色调(#5E6AD2)
- **精致细节**: 精细的边框、阴影和过渡效果
- **现代交互**: 悬停效果、平滑过渡等
