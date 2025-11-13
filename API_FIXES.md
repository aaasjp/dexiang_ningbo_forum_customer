# API 接口修正说明

## 修正日期
2024年（根据实际日期）

## 修正原因
根据 `forum-management/docs/API_DOCUMENTATION.md` 中的官方接口文档，修正前端 API 调用中的错误。

## 修正文件列表

### 1. `forum-management/src/api/users.js` ✅

**问题：**
- 用户列表接口路径错误：使用了 `/staff/list` 而非 `/admin/staffs/list`
- 禁用用户接口错误：使用了 `POST /staff/forbidden` 而非 `PUT /admin/staffs/forbidden/{staff_code}`
- 部门管理员接口错误：使用了 `POST /staff/dept-admin` 而非 `PUT /admin/dept-admins/status/{staff_code}`
- 调整积分接口错误：使用了 `POST /staff/adjust-points` 而非 `PUT /admin/staffs/points/{staff_code}`

**修正后：**
```javascript
// 1. 获取用户列表（管理端）
GET /admin/staffs/list
参数: { page, page_size, dept_id, forum_tag, keyword }

// 2. 禁用/取消禁用员工
PUT /admin/staffs/forbidden/{staff_code}
查询参数: { is_forbidden }

// 3. 取消/恢复部门管理员权限
PUT /admin/dept-admins/status/{staff_code}
查询参数: { dept_id, status }

// 4. 调整员工积分
PUT /admin/staffs/points/{staff_code}
查询参数: { current_points, new_points }
```

**参考文档：**
- API文档 9.13: 用户列表
- API文档 9.19: 禁用/取消禁用员工
- API文档 9.20: 取消/恢复部门管理员权限
- API文档 9.22: 调整员工积分

---

### 2. `forum-management/src/api/points.js` ✅

**问题：**
- `updateRewardRule` 函数 URL 多了 `/api` 前缀
- `deleteRewardRule` 函数 URL 多了 `/api` 前缀

**原因：**
`request.js` 中 `baseURL` 已经包含了 `/api` 前缀（`http://220.154.134.61:8000/api`），因此所有接口路径都不应该再加 `/api`。

**修正前：**
```javascript
url: `/api/admin/reward-rules/update/${ruleId}`  // ❌ 错误
url: `/api/admin/reward-rules/delete/${ruleId}`  // ❌ 错误
```

**修正后：**
```javascript
url: `/admin/reward-rules/update/${ruleId}`  // ✅ 正确
url: `/admin/reward-rules/delete/${ruleId}`  // ✅ 正确
```

---

### 3. `forum-management/src/api/logs.js` ✅

**问题：**
- `getLogDetail` 函数 URL 多了 `/api` 前缀

**修正前：**
```javascript
url: `/api/admin/logs/${logId}`  // ❌ 错误
```

**修正后：**
```javascript
url: `/admin/logs/${logId}`  // ✅ 正确
```

---

## 已检查无问题的文件

### ✅ `forum-management/src/api/content.js`
所有接口路径正确，符合 API 文档规范。

### ✅ `forum-management/src/api/topics.js`
所有接口路径正确，符合 API 文档规范。

### ✅ `forum-management/src/api/dashboard.js`
所有接口路径正确，符合 API 文档规范。

### ✅ `forum-management/src/api/department.js`
所有接口路径正确，符合 API 文档规范。

### ✅ `forum-management/src/api/index.js`
仅包含模块导出，无需修改。

---

## 重要规范说明

### 1. 统一的 baseURL 配置
```javascript
// forum-management/src/utils/request.js
baseURL: 'http://220.154.134.61:8000/api'
```

**规则：**
- 所有 API 路径都不应该再加 `/api` 前缀
- 正确：`/admin/staffs/list`
- 错误：`/api/admin/staffs/list`

### 2. 接口路径规范
- **管理端接口**：以 `/admin/` 开头
- **普通接口**：其他路径（如 `/topics/list`, `/department/tree`）

### 3. HTTP 方法规范
根据 API 文档，不同操作使用不同的 HTTP 方法：
- **查询列表/详情**：`GET`
- **创建**：`POST`
- **更新/修改**：`PUT`
- **删除**：`DELETE`

### 4. 参数传递规范
- **GET 请求**：使用 `params`（查询参数）
- **POST/PUT 请求**：
  - 查询参数：使用 `params`
  - 请求体：使用 `data`

---

## 后续注意事项

1. **新增 API 时**：务必参考 `API_DOCUMENTATION.md` 中的接口定义
2. **修改 API 时**：确保路径、方法、参数都与文档一致
3. **baseURL 修改**：如果修改了 `baseURL`，需要检查所有 API 路径是否受影响
4. **版本控制**：API 文档变更时，及时同步前端接口

---

## 测试建议

修正完成后，建议测试以下功能：

### 用户管理模块
- [ ] 用户列表加载
- [ ] 用户禁用/启用
- [ ] 部门管理员权限设置
- [ ] 用户积分调整

### 积分管理模块
- [ ] 奖励规则列表
- [ ] 奖励规则更新
- [ ] 奖励规则删除

### 日志管理模块
- [ ] 操作日志列表
- [ ] 日志详情查看

---

## 修正结果

✅ 所有 API 接口已与官方文档保持一致
✅ 移除了多余的 `/api` 前缀
✅ 统一了 HTTP 方法和参数传递方式
✅ 添加了详细的 JSDoc 注释和文档引用


