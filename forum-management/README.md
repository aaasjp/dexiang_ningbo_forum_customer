# 论坛管理系统

基于 Vue3 + Vite + Element Plus 的论坛管理后台系统。

## 功能模块

1. **数据看板** - 展示用户活跃数、问题数、回答数、解决率等核心指标
2. **内容管理** - 管理论坛内容,支持上线/下线、编辑等操作
3. **话题管理** - 管理论坛话题,卡片式展示
4. **用户管理** - 管理用户信息、角色、积分等
5. **积分规则** - 配置用户积分获取规则

## 技术栈

- Vue 3 - 渐进式 JavaScript 框架
- Vite - 下一代前端构建工具
- Element Plus - Vue 3 UI 组件库
- Vue Router - 官方路由管理器

## 安装依赖

```bash
npm install
```

## 启动开发服务器

```bash
npm run dev
```

## 构建生产版本

```bash
npm run build
```

## 项目结构

```
forum-management/
├── src/
│   ├── components/      # 公共组件
│   │   └── Layout.vue   # 布局组件
│   ├── views/           # 页面组件
│   │   ├── Dashboard.vue    # 数据看板
│   │   ├── Content.vue      # 内容管理
│   │   ├── Topics.vue       # 话题管理
│   │   ├── Users.vue        # 用户管理
│   │   └── Points.vue       # 积分规则
│   ├── router/          # 路由配置
│   │   └── index.js
│   ├── mock/            # Mock 数据
│   │   └── data.js
│   ├── App.vue          # 根组件
│   ├── main.js          # 入口文件
│   └── style.css        # 全局样式
├── public/              # 静态资源
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
└── package.json         # 项目配置

```

## 特性

- ✅ 响应式设计
- ✅ 现代化 UI 界面
- ✅ 完整的路由导航
- ✅ Mock 数据支持
- ✅ Element Plus 组件库
- ✅ 模块化代码结构

## 页面预览

- 数据看板:统计卡片 + 部门数据表格 + 话题排行榜
- 内容管理:筛选器 + 数据表格 + 分页
- 话题管理:卡片式布局 + 响应式网格
- 用户管理:用户列表 + 角色管理 + 状态切换
- 积分规则:积分规则列表 + 增删改操作
