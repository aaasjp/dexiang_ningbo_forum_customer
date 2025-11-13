# 内容管理页面功能说明

## 更新日期
2025-11-10

## 功能概述
本次更新为内容管理页面（Content.vue）增加了完整的编辑、精选和删除功能，参考了forum项目中的话题选择和部门选择逻辑。

## 新增功能

### 1. 编辑功能
**位置**: 操作列 - 编辑按钮

**功能说明**:
- 点击"编辑"按钮打开编辑弹框
- 弹框中可以选择部门和话题
- 支持多选部门（树形结构）
- 支持多选话题（最多3个）
- 部门和话题都支持搜索功能

**技术实现**:
- 使用 `ContentFormDialog` 组件
- 调用 `transferQuestion` API 进行转办
- 支持部门树形结构展示和选择
- 话题列表展示和多选（最多3个）

**使用流程**:
1. 点击某条内容的"编辑"按钮
2. 在弹框中选择部门：
   - 点击"选择部门"按钮
   - 在树形结构中勾选需要的部门
   - 支持搜索部门名称
   - 点击"确定"完成部门选择
3. 在弹框中选择话题：
   - 点击"选择话题"按钮
   - 在列表中点击需要的话题（最多3个）
   - 支持搜索话题名称
   - 点击"确定"完成话题选择
4. 点击"确定"保存修改

### 2. 精选功能
**位置**: 表格列 - 精选列

**功能说明**:
- 显示当前内容的精选状态
- 点击状态文字可切换精选状态
- "标记精选"（橙色）表示已精选
- "取消精选"（灰色）表示未精选

**技术实现**:
- 使用 `markFeatured` API
- 支持状态切换（0/1）
- 实时更新列表数据

**使用流程**:
1. 在精选列找到目标内容
2. 点击状态文字（"标记精选" 或 "取消精选"）
3. 系统自动切换状态并刷新列表

### 3. 删除功能
**位置**: 操作列 - 删除按钮

**功能说明**:
- 点击"删除"按钮打开确认弹框
- 确认后删除该条内容
- 删除成功后自动刷新列表

**技术实现**:
- 使用 `DeleteConfirmDialog` 组件
- 调用 `deleteQuestion` API
- 删除成功后刷新列表

**使用流程**:
1. 点击某条内容的"删除"按钮
2. 在确认弹框中点击"确定"
3. 系统删除该内容并刷新列表

### 4. 详情功能
**位置**: 操作列 - 详情按钮

**功能说明**:
- 点击"详情"按钮查看内容详情
- 当前为占位功能，显示提示信息

**技术实现**:
- 预留接口，待后续实现

## 组件说明

### ContentFormDialog 组件
**文件路径**: `src/components/ContentFormDialog.vue`

**主要功能**:
- 部门选择（树形结构，支持多选）
- 话题选择（列表形式，最多3个）
- 搜索功能（部门和话题）
- 表单验证

**Props**:
- `modelValue`: Boolean - 控制弹框显示
- `data`: Object - 编辑的数据对象

**Events**:
- `update:modelValue`: 更新弹框显示状态
- `confirm`: 确认提交，返回 `{ dept_ids: [], topic_ids: [] }`

**数据结构**:
```javascript
// 传入的 data 格式
{
  question_id: 1,
  related_depts: [
    { dept_id: 1, dept_name: "技术部" }
  ],
  topics: [
    { topic_id: 1, title: "技术交流" }
  ]
}

// 返回的数据格式
{
  dept_ids: [1, 2],
  topic_ids: [1, 2]
}
```

## API 接口

### 1. 转办问题（编辑）
- **接口**: `POST /api/admin/questions/transfer/{question_id}`
- **方法**: `transferQuestion(questionId, data)`
- **参数**: 
  - `questionId`: 问题ID
  - `data`: `{ dept_ids: [], topic_ids: [] }`

### 2. 标记精选
- **接口**: `PUT /api/admin/questions/mark-featured/{question_id}`
- **方法**: `markFeatured(questionId, isFeatured)`
- **参数**: 
  - `questionId`: 问题ID
  - `isFeatured`: 0 或 1

### 3. 删除问题
- **接口**: `DELETE /api/admin/questions/delete/{question_id}`
- **方法**: `deleteQuestion(questionId)`
- **参数**: 
  - `questionId`: 问题ID

### 4. 获取部门树
- **接口**: `GET /api/departments/tree`
- **方法**: `getDepartmentTree(params)`

### 5. 获取话题列表
- **接口**: `GET /api/topics/list`
- **方法**: `getTopicsList(params)`

## 样式说明

### 精选状态样式
- **已精选** (status-featured): 橙色 (#FF7800)，加粗
- **未精选** (status-not-featured): 灰色 (#999999)
- 鼠标悬停时透明度变化，提示可点击

### 按钮样式
- **编辑**: 橙色链接按钮
- **详情**: 橙色链接按钮
- **删除**: 灰色链接按钮

## 注意事项

1. **权限控制**: 所有操作都需要管理员权限
2. **数据验证**: 编辑时至少需要选择一个部门和一个话题
3. **话题限制**: 最多只能选择3个话题
4. **删除确认**: 删除操作需要二次确认
5. **实时刷新**: 所有操作成功后都会自动刷新列表

## 测试建议

### 1. 编辑功能测试
- [ ] 打开编辑弹框，检查是否正确显示当前的部门和话题
- [ ] 测试部门选择功能（单选、多选、取消选择）
- [ ] 测试话题选择功能（最多3个限制）
- [ ] 测试搜索功能（部门搜索、话题搜索）
- [ ] 测试表单验证（不选部门、不选话题）
- [ ] 提交后检查数据是否正确更新

### 2. 精选功能测试
- [ ] 点击"取消精选"，检查是否变为"标记精选"
- [ ] 点击"标记精选"，检查是否变为"取消精选"
- [ ] 检查状态切换后列表是否正确刷新
- [ ] 检查样式是否正确（颜色、字体）

### 3. 删除功能测试
- [ ] 点击删除按钮，检查是否弹出确认框
- [ ] 点击取消，检查弹框是否关闭且数据未删除
- [ ] 点击确定，检查数据是否被删除
- [ ] 检查删除后列表是否正确刷新

### 4. 边界情况测试
- [ ] 测试网络错误情况的处理
- [ ] 测试并发操作的处理
- [ ] 测试数据为空的情况
- [ ] 测试长文本的显示

## 参考资料
- Forum项目发布页面: `/Users/ailabuser2-1/Documents/mywork/forum/src/pages/publish/index.vue`
- 话题选择组件: `/Users/ailabuser2-1/Documents/mywork/forum/src/components/publish/TopicModal.vue`
- 部门选择组件: `/Users/ailabuser2-1/Documents/mywork/forum/src/components/publish/MentionModal.vue`

