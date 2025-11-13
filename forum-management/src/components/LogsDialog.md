# LogsDialog 操作记录弹框组件

## 概述
`LogsDialog.vue` 是一个用于展示系统操作记录的弹框组件，包含搜索、表格展示和分页功能。

## 功能特性
- ✅ 用户工号搜索
- ✅ 操作日志列表展示
- ✅ 分页功能（支持10/20/50/100条/页）
- ✅ 操作类型中文化显示
- ✅ 时间格式化显示
- ✅ 加载状态提示
- ✅ 样式与其他页面保持一致

## 使用方法

### 1. 导入组件

```vue
<script setup>
import LogsDialog from '@/components/LogsDialog.vue'
import { ref } from 'vue'

const logsDialogVisible = ref(false)

const showLogsDialog = () => {
  logsDialogVisible.value = true
}
</script>
```

### 2. 在模板中使用

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <el-button @click="showLogsDialog">查看操作记录</el-button>
    
    <!-- 操作记录弹框 -->
    <LogsDialog 
      v-model="logsDialogVisible"
      title="操作记录"
      width="1200px"
    />
  </div>
</template>
```

### 3. 完整示例

```vue
<template>
  <div class="page">
    <el-button type="primary" @click="openLogsDialog">
      查看操作记录
    </el-button>
    
    <LogsDialog 
      v-model="logsDialogVisible"
      title="系统操作记录"
      width="1200px"
      @cancel="handleDialogCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LogsDialog from '@/components/LogsDialog.vue'

const logsDialogVisible = ref(false)

const openLogsDialog = () => {
  logsDialogVisible.value = true
}

const handleDialogCancel = () => {
  console.log('弹框已关闭')
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|-----|------|------|--------|
| modelValue | 控制弹框显示/隐藏 | Boolean | false |
| title | 弹框标题 | String | '操作记录' |
| width | 弹框宽度 | String | '1200px' |

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 弹框显示状态变化时触发 | value: Boolean |
| cancel | 点击取消或关闭按钮时触发 | - |

## API 接口

组件使用以下 API 接口：

**接口**: `GET /api/admin/logs/list`

**请求参数**:
- `user_code` (string, 可选): 用户工号
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认10

**响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "log_id": 1,
        "user_code": "001",
        "user_name": "张三",
        "operation_type": "question_delete",
        "target_type": "question",
        "target_id": 1,
        "content": "删除问题：问题标题",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "create_time": "2024-01-01T10:00:00"
      }
    ],
    "total": 100
  }
}
```

## 操作类型映射

组件自动将后端返回的操作类型转换为中文：

| 操作类型代码 | 中文显示 |
|-------------|----------|
| question_delete | 删除问题 |
| question_create | 创建问题 |
| question_update | 更新问题 |
| answer_delete | 删除回答 |
| answer_create | 创建回答 |
| answer_update | 更新回答 |
| comment_delete | 删除评论 |
| comment_create | 创建评论 |
| user_forbidden | 禁用用户 |
| user_unforbidden | 启用用户 |
| points_adjust | 调整积分 |
| role_change | 变更角色 |
| admin_add | 添加管理员 |
| admin_remove | 移除管理员 |

## 表格字段说明

| 字段 | 说明 | 宽度 |
|------|------|------|
| 序号 | 当前页的序号 | 80px |
| 用户工号 | 操作用户的工号 | 120px |
| 用户姓名 | 操作用户的姓名 | 120px |
| 操作类型 | 操作类型（中文） | 150px |
| 操作内容 | 操作的详细内容 | 自适应 |
| IP地址 | 操作来源IP | 140px |
| 操作时间 | 操作发生的时间 | 180px |

## 样式说明

组件样式与现有页面保持一致：
- 弹框宽度：1200px（可自定义）
- 弹框最大高度：90vh
- 表格行高：根据内容自适应
- 搜索框高度：44px
- 按钮高度：44px
- 分页器：标准样式

## 注意事项

1. **权限控制**: 确保调用接口的用户具有管理员权限
2. **数据加载**: 弹框打开时自动加载数据，关闭后不清空搜索条件
3. **搜索功能**: 支持按回车键搜索
4. **时间格式**: 自动将后端时间格式化为 `YYYY-MM-DD HH:mm:ss`
5. **空数据**: 无数据时显示空状态提示

## 扩展建议

如需扩展更多功能，可以考虑：
1. 添加操作类型筛选下拉框
2. 添加时间范围选择器
3. 添加导出功能
4. 添加查看详情功能
5. 添加操作内容的关键词搜索

## 相关文件

- API 文件: `/src/api/logs.js`
- 组件文件: `/src/components/LogsDialog.vue`
- API 文档: `/docs/API_DOCUMENTATION.md` (9.14 操作日志)



