# 论坛项目

基于 Vue 3 + TypeScript + Vite + Pinia + Vue Router 构建的移动端论坛应用。

## 功能特性

### 底部导航栏
- 首页
- 话题
- 发布
- 消息
- 我的

### 页面功能

#### 首页
- 推荐 Tab：展示推荐帖子列表
- 关注 Tab：展示关注用户的帖子列表

#### 话题
- 话题列表：浏览所有话题
- 话题详情：查看话题详情和相关讨论
- 话题搜索：搜索感兴趣的话题
- 话题关注：关注/取消关注话题

#### 发布
- 发布帖子：创建新帖子
- 选择话题：关联话题
- 添加标签：为帖子添加标签
- 富文本编辑：支持文字、图片等内容

#### 消息
- 消息列表：查看所有消息
- 消息详情：查看和回复消息
- 未读提醒：显示未读消息数量

#### 我的
- 个人中心：展示个人信息和统计数据
- 个人资料：编辑个人信息
- 个人主页：查看自己或他人的主页
- 我的收藏：查看收藏的帖子和话题
- 我的积分：查看积分和积分记录
- 我的回答：查看自己的回答
- 我的提问：查看自己的提问

#### 帖子
- 帖子列表：浏览所有帖子
- 帖子详情：查看帖子详细内容
- 帖子发布：创建新帖子
- 帖子回复：评论和回复帖子
- 帖子互动：点赞、收藏、分享

## 技术栈

- **框架**: Vue 3
- **语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **样式**: CSS3

## 项目结构

```
forum/
├── src/
│   ├── components/          # 组件
│   │   └── layout/         # 布局组件
│   │       ├── Layout.vue  # 主布局
│   │       └── TabBar.vue  # 底部导航栏
│   ├── pages/              # 页面
│   │   ├── home/           # 首页
│   │   ├── topic/          # 话题
│   │   ├── publish/        # 发布
│   │   ├── message/        # 消息
│   │   ├── profile/        # 个人中心
│   │   └── post/           # 帖子
│   ├── router/             # 路由配置
│   ├── stores/             # 状态管理
│   │   ├── app.ts          # 应用状态
│   │   └── user.ts         # 用户状态
│   ├── types/              # 类型定义
│   ├── utils/              # 工具函数
│   ├── App.vue             # 根组件
│   ├── main.ts             # 入口文件
│   └── style.css           # 全局样式
├── public/                 # 静态资源
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 项目说明
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 路由说明

- `/home` - 首页
- `/topic` - 话题列表
- `/topic/:id` - 话题详情
- `/publish` - 发布页面
- `/message` - 消息列表
- `/message/:id` - 消息详情
- `/profile` - 个人中心
- `/profile/info` - 个人资料
- `/profile/home/:id?` - 个人主页
- `/profile/favorites` - 我的收藏
- `/profile/points` - 我的积分
- `/profile/answers` - 我的回答
- `/profile/questions` - 我的提问
- `/post` - 帖子列表
- `/post/:id` - 帖子详情
- `/post/create` - 发布帖子

## 后续开发

当前项目已完成基础结构和页面框架，后续可以：

1. 接入后端 API
2. 完善数据交互逻辑
3. 添加用户认证功能
4. 优化 UI/UX 设计
5. 添加更多功能特性
6. 性能优化
7. 单元测试

## 注意事项

- 项目使用 TypeScript，请注意类型定义
- 组件采用 Composition API 编写
- 样式使用 scoped CSS
- 路由采用懒加载方式
- 状态管理使用 Pinia
