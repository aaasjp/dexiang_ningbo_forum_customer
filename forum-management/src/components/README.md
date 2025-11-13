# 表单弹框组件库

## 📦 组件概览

根据设计图完成的一套统一风格的表单弹框组件，包含以下组件：

| 组件名 | 文件名 | 用途 | 状态 |
|--------|--------|------|------|
| 基础表单弹框 | `FormDialog.vue` | 通用表单弹框基础组件 | ✅ 已完成 |
| 积分规则表单 | `PointsFormDialog.vue` | 新增/编辑积分规则 | ✅ 已完成 |
| 积分调整弹框 | `PointsAdjustDialog.vue` | 调整用户积分 | ✅ 已完成 |
| 话题表单弹框 | `TopicFormDialog.vue` | 创建/编辑话题 | ✅ 已完成 |
| 内容编辑弹框 | `ContentFormDialog.vue` | 编辑内容信息 | ✅ 已完成 |
| 删除确认弹框 | `DeleteConfirmDialog.vue` | 删除确认提示 | ✅ 已完成 |

## 🎨 设计特点

### 统一的视觉风格
- **弹框样式**：白色背景，8px 圆角，右上角关闭按钮
- **表单字段**：必填项带红色星号 (*)，统一的间距和对齐
- **输入框**：聚焦时边框变为橙色 (#fa8c16)
- **按钮**：取消按钮为灰色边框，确定按钮为橙色背景

### 交互特性
- ✅ 自动表单验证
- ✅ 关闭时自动重置表单
- ✅ v-model 双向绑定
- ✅ 统一的 Hover 效果

## 📝 使用示例

### 1. FormDialog（基础组件）

所有表单弹框的基础组件，支持自定义表单内容。

```vue
<template>
  <FormDialog
    v-model="showDialog"
    title="自定义表单"
    :form-data="formData"
    :rules="formRules"
    @confirm="handleConfirm"
  >
    <template #form="{ formData }">
      <el-form-item label="字段名" prop="fieldName">
        <el-input v-model="formData.fieldName" />
      </el-form-item>
    </template>
  </FormDialog>
</template>

<script setup>
import FormDialog from '@/components/FormDialog.vue'
import { ref } from 'vue'

const showDialog = ref(false)
const formData = ref({ fieldName: '' })
const formRules = {
  fieldName: [{ required: true, message: '请输入字段名', trigger: 'blur' }]
}

const handleConfirm = (data) => {
  console.log('提交数据：', data)
}
</script>
```

**Props:**
- `modelValue` (Boolean): 控制显示/隐藏
- `title` (String): 弹框标题
- `width` (String): 弹框宽度，默认 '620px'
- `formData` (Object): 表单数据
- `rules` (Object): 验证规则

**Events:**
- `confirm`: 点击确定并验证通过后触发
- `cancel`: 点击取消时触发
- `close`: 弹框关闭时触发

---

### 2. PointsFormDialog（积分规则表单）

用于新增或编辑积分规则。

```vue
<template>
  <PointsFormDialog
    v-model="showDialog"
    :title="isEdit ? '编辑' : '新增'"
    :data="editData"
    @confirm="handleConfirm"
  />
</template>

<script setup>
import PointsFormDialog from '@/components/PointsFormDialog.vue'
import { ref } from 'vue'

const showDialog = ref(false)
const isEdit = ref(false)
const editData = ref({
  action: '发布问题',
  points: 30
})

const handleConfirm = (data) => {
  console.log('行为：', data.action)
  console.log('积分值：', data.points)
}
</script>
```

**表单字段:**
- 行为（必填）：下拉选择
- 积分值（必填）：数字输入

---

### 3. PointsAdjustDialog（积分调整）

用于调整用户积分。

```vue
<template>
  <PointsAdjustDialog
    v-model="showDialog"
    :initial-points="9900"
    @confirm="handleConfirm"
  />
</template>

<script setup>
import PointsAdjustDialog from '@/components/PointsAdjustDialog.vue'
import { ref } from 'vue'

const showDialog = ref(false)

const handleConfirm = (data) => {
  console.log('调整积分：', data.adjustPoints)
  console.log('调整后积分：', data.newPoints)
}
</script>
```

**Props:**
- `initialPoints` (Number): 初始积分值

**表单字段:**
- 初始积分（只读）：显示当前积分
- 积分值修改（必填）：数字输入，支持正负数

---

### 4. TopicFormDialog（话题表单）

用于创建或编辑话题。

```vue
<template>
  <TopicFormDialog
    v-model="showDialog"
    :title="isEdit ? '编辑话题' : '创建新话题'"
    :data="editData"
    @confirm="handleConfirm"
  />
</template>

<script setup>
import TopicFormDialog from '@/components/TopicFormDialog.vue'
import { ref } from 'vue'

const showDialog = ref(false)
const isEdit = ref(false)
const editData = ref({})

const handleConfirm = (data) => {
  console.log('封面图片：', data.coverImage)
  console.log('话题名称：', data.topicName)
  console.log('话题描述：', data.description)
}
</script>
```

**表单字段:**
- 封面图片：图片上传（≤5MB，支持 png/jpg）
- 话题名称（必填）：下拉选择
- 话题描述（必填）：多行文本输入

---

### 5. ContentFormDialog（内容编辑）

用于编辑内容的部门和话题信息。

```vue
<template>
  <ContentFormDialog
    v-model="showDialog"
    :data="editData"
    @confirm="handleConfirm"
  />
</template>

<script setup>
import ContentFormDialog from '@/components/ContentFormDialog.vue'
import { ref } from 'vue'

const showDialog = ref(false)
const editData = ref({
  department: '销售部',
  topic: '银行知识'
})

const handleConfirm = (data) => {
  console.log('解决部门：', data.department)
  console.log('所属话题：', data.topic)
}
</script>
```

**表单字段:**
- 解决部门（必填）：文本输入
- 所属话题（必填）：下拉选择

---

### 6. DeleteConfirmDialog（删除确认）

用于删除操作的二次确认。

```vue
<template>
  <DeleteConfirmDialog
    v-model="showDialog"
    message="确定删除该项目吗？"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<script setup>
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue'
import { ref } from 'vue'

const showDialog = ref(false)

const handleConfirm = () => {
  console.log('用户确认删除')
}

const handleCancel = () => {
  console.log('用户取消删除')
}
</script>
```

**Props:**
- `message` (String): 确认提示消息

---

## 🚀 快速开始

### 1. 在项目中使用

```vue
<script setup>
// 引入需要的组件
import PointsFormDialog from '@/components/PointsFormDialog.vue'
import { ref } from 'vue'

// 定义弹框状态
const showDialog = ref(false)

// 处理表单提交
const handleConfirm = (data) => {
  // 处理业务逻辑
  console.log(data)
}
</script>

<template>
  <div>
    <el-button @click="showDialog = true">打开弹框</el-button>
    
    <PointsFormDialog
      v-model="showDialog"
      title="新增"
      @confirm="handleConfirm"
    />
  </div>
</template>
```

### 2. 查看完整演示

运行项目后访问 `DialogDemo.vue` 页面，可以查看所有弹框组件的交互演示：

```bash
npm run dev
```

然后在路由中访问演示页面。

---

## 📚 实际应用示例

### Points.vue（积分管理页面）

已经集成了 `PointsFormDialog` 和 `DeleteConfirmDialog`，展示了完整的增删改查功能：

- ✅ 新增积分规则
- ✅ 编辑积分规则
- ✅ 删除积分规则
- ✅ 表单验证
- ✅ 成功提示

可以参考 `/src/views/Points.vue` 文件查看具体实现。

---

## 🎯 设计规范

### 颜色规范
- 主色调：`#fa8c16` (橙色)
- 主色调 Hover：`#ff9d3d`
- 主色调 Active：`#d87a0f`
- 边框色：`#d9d9d9`
- 文字色：`#1a1a1a`
- 占位符色：`#bfbfbf`
- 辅助文字色：`#999999`

### 尺寸规范
- 弹框宽度：`620px`（话题表单为 `680px`）
- 弹框圆角：`8px`
- 输入框圆角：`4px`
- 按钮最小宽度：`80px`
- 按钮高度：`36px`
- 表单项间距：`24px`

### 字体规范
- 标题字体：`16px / 500`
- 表单标签：`14px / 400`
- 输入内容：`14px / 400`
- 按钮文字：`14px`

---

## 📖 更多文档

- [详细使用文档](./FormDialogs.md)
- [完整演示页面](../views/DialogDemo.vue)
- [积分管理示例](../views/Points.vue)

---

## 🤝 贡献

如需新增或修改弹框组件，请遵循以下原则：

1. ✅ 保持统一的视觉风格
2. ✅ 使用 `FormDialog` 作为基础组件
3. ✅ 遵循现有的设计规范
4. ✅ 添加必要的表单验证
5. ✅ 提供清晰的使用示例

---

**创建时间**: 2025-11-07  
**版本**: 1.0.0  
**维护者**: Forum Management Team



