# API 集成说明文档

## 概述

本次更新将前端项目从使用 mock 数据改为调用真实的后端 API 接口。所有接口都已根据 `API_DOCUMENTATION.md` 中的规范进行集成。

## 主要改动

### 1. 创建了 API 请求工具模块

**文件**: `src/utils/request.js`

- 使用 axios 创建统一的请求实例
- 配置了基础 URL: `http://10.129.114.106:8000`
- 自动添加 `gw_session` 请求头（模拟数据）
- 统一的请求/响应拦截器处理
- 统一的错误处理和提示

### 2. 创建了 API 服务模块

创建了以下 API 服务文件:

- `src/api/dashboard.js` - 数据看板相关接口
- `src/api/content.js` - 内容管理相关接口
- `src/api/topics.js` - 话题管理相关接口
- `src/api/users.js` - 用户管理相关接口
- `src/api/points.js` - 积分规则相关接口
- `src/api/department.js` - 部门相关接口
- `src/api/logs.js` - 操作日志相关接口
- `src/api/index.js` - 统一导出所有 API

### 3. 更新了所有页面组件

#### Dashboard.vue (数据看板)
- 集成 `/api/admin/dashboard` 接口
- 支持时间范围筛选（全部/今天/本周/本月）
- 自动格式化数字显示（w/k）
- 实时获取统计数据、部门数据和话题排行榜

#### Content.vue (内容管理)
- 集成问题列表接口 `/api/admin/questions/list`
- 支持按类型、状态、时间、关键词筛选
- 支持问题上线/下线切换
- 支持删除问题功能
- 分页加载

#### Topics.vue (话题管理)
- 集成话题列表接口 `/api/topics/list`
- 显示话题信息和关联内容数
- 支持创建、编辑、删除话题（待完善）
- 分页加载

#### Users.vue (用户管理)
- 集成用户列表接口 `/api/admin/staffs/list`
- 支持按部门、角色、关键词筛选
- 支持禁用/启用用户
- 支持设置/取消管理员权限
- 支持调整用户积分
- 分页加载

#### Points.vue (积分规则)
- 集成奖励规则接口 `/api/admin/reward-rules/list`
- 支持创建、编辑、删除积分规则
- 分页加载

## 安装依赖

项目需要安装 `axios` 依赖:

```bash
npm install axios
```

或

```bash
yarn add axios
```

或

```bash
pnpm add axios
```

## 配置说明

### API 基础地址

在 `src/utils/request.js` 中配置:

```javascript
baseURL: 'http://10.129.114.106:8000'
```

### 模拟登录凭证

在 `src/utils/request.js` 中配置:

```javascript
const GW_SESSION = 'appid=500883957,name=张三,depatment=人力资源部,orgId=2,jobTitle=管理员,gender=2,status=1,jobNo=staff001'
```

## 主要功能特性

### 1. 统一的错误处理
- 自动捕获请求错误
- 统一的错误提示消息
- HTTP 状态码处理（401、403、404、500等）

### 2. 自动加载状态
- 所有页面都有 loading 状态管理
- 避免重复请求

### 3. 数据格式化
- 数字格式化（w/k 单位）
- 日期时间格式化
- 状态映射

### 4. 响应式筛选
- 使用 Vue 的 watch 监听筛选条件变化
- 自动重置分页
- 实时获取数据

### 5. 分页支持
- 所有列表页面都支持分页
- 可自定义每页显示数量
- 显示总数

## API 接口映射

### 数据看板
- `GET /api/admin/dashboard` - 获取 Dashboard 数据

### 内容管理
- `GET /api/admin/questions/list` - 获取问题列表
- `PUT /api/admin/questions/offline/:id` - 问题上线/下线
- `DELETE /api/admin/questions/delete/:id` - 删除问题
- `PUT /api/admin/questions/mark-featured/:id` - 标记精选
- `POST /api/admin/questions/transfer/:id` - 人力转办

### 话题管理
- `GET /api/topics/list` - 获取话题列表
- `POST /api/admin/topics/create` - 创建话题
- `PUT /api/admin/topics/update/:id` - 更新话题
- `GET /api/topics/detail/:id` - 获取话题详情

### 用户管理
- `GET /api/admin/staffs/list` - 获取用户列表
- `PUT /api/admin/staffs/forbidden/:code` - 禁用/启用用户
- `PUT /api/admin/dept-admins/status/:code` - 设置/取消管理员
- `PUT /api/admin/staffs/points/:code` - 调整用户积分

### 积分规则
- `GET /api/admin/reward-rules/list` - 获取奖励规则列表
- `POST /api/admin/reward-rules/create` - 创建奖励规则
- `PUT /api/admin/reward-rules/update/:id` - 更新奖励规则
- `DELETE /api/admin/reward-rules/delete/:id` - 删除奖励规则

### 部门
- `GET /api/department/tree` - 查询部门组织和人员

### 操作日志
- `GET /api/admin/logs/list` - 获取操作日志列表
- `GET /api/admin/logs/:id` - 查看操作记录详情

## 运行项目

1. 安装依赖:
```bash
npm install
```

2. 启动开发服务器:
```bash
npm run dev
```

3. 构建生产版本:
```bash
npm run build
```

## 注意事项

1. **跨域问题**: 如果遇到跨域问题，需要配置 Vite 代理或后端 CORS
2. **认证**: 当前使用模拟的 `gw_session`，实际使用时需要从实际登录获取
3. **错误处理**: 所有接口调用都有错误处理，会显示友好的错误提示
4. **数据格式**: 接口返回的数据已经过格式化处理，直接用于显示

## 待完善功能

以下功能已预留接口调用，但需要进一步完善:

1. **内容管理**:
   - 编辑问题
   - 查看详情
   - 人力转办

2. **话题管理**:
   - 创建话题弹窗
   - 编辑话题弹窗
   - 删除话题确认

3. **用户管理**:
   - 角色切换（目前只有禁用/启用和管理员权限）

4. **操作记录**:
   - 查看操作记录详情页面

## 调试建议

1. 打开浏览器开发者工具的 Network 面板查看 API 请求
2. 查看 Console 面板的日志输出
3. 检查 `src/utils/request.js` 中的 baseURL 配置是否正确
4. 确认后端服务是否正常运行

## 联系方式

如有问题，请查看:
- API 文档: `docs/API_DOCUMENTATION.md`
- 项目 README: `README.md`


