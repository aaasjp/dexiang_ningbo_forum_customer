# DeleteConfirmDialog 删除确认弹框组件

## 组件说明

这是一个通用的删除确认弹框组件，样式符合设计规范，包含警告图标、提示信息和操作按钮。

## 使用方法

### 1. 导入组件

```javascript
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.vue'
```

### 2. 在模板中使用

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <el-button @click="showDeleteDialog = true">删除</el-button>

    <!-- 删除确认弹框 -->
    <DeleteConfirmDialog
      v-model="showDeleteDialog"
      message="确定删除该任务吗？"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.vue'

const showDeleteDialog = ref(false)

const handleDeleteConfirm = () => {
  console.log('确认删除')
  // 执行删除操作
}

const handleDeleteCancel = () => {
  console.log('取消删除')
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue (v-model) | 是否显示弹框 | Boolean | false |
| message | 提示信息文本 | String | '确定删除该任务吗？' |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| confirm | 点击确定按钮时触发 | - |
| cancel | 点击取消按钮时触发 | - |
| update:modelValue | 弹框显示状态改变时触发 | (value: boolean) |

## 样式特点

- 弹框宽度：420px
- 圆角：8px
- 警告图标：橙色 (#fa8c16)，24px
- 提示文字：16px，颜色 #1a1a1a
- 取消按钮：白色背景，灰色边框，hover 时变为橙色
- 确定按钮：橙色背景 (#fa8c16)，白色文字

## 示例场景

- 删除内容
- 删除话题
- 删除用户
- 其他需要二次确认的操作

## 自定义提示信息

```vue
<DeleteConfirmDialog
  v-model="showDialog"
  message="确定要删除这条记录吗？删除后将无法恢复！"
  @confirm="handleConfirm"
/>
```

