# 表单弹框组件使用文档

这些表单弹框组件提供统一的样式和交互体验，适用于不同的业务场景。

## 组件列表

### 1. FormDialog (基础组件)
通用表单弹框组件，其他表单弹框都基于此组件封装。

**属性：**
- `modelValue` (Boolean): 控制弹框显示/隐藏
- `title` (String): 弹框标题
- `width` (String): 弹框宽度，默认 '620px'
- `formData` (Object): 表单数据对象
- `rules` (Object): 表单验证规则

**事件：**
- `confirm`: 点击确定按钮触发，返回表单数据
- `cancel`: 点击取消按钮触发
- `close`: 弹框关闭时触发

**插槽：**
- `form`: 表单内容插槽，接收 formData 参数

---

### 2. PointsFormDialog (积分规则表单)
用于新增或编辑积分规则。

**使用示例：**

```vue
<template>
  <div>
    <el-button @click="showDialog = true">新增规则</el-button>
    
    <PointsFormDialog
      v-model="showDialog"
      :title="isEdit ? '编辑' : '新增'"
      :data="editData"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PointsFormDialog from '@/components/PointsFormDialog.vue'

const showDialog = ref(false)
const isEdit = ref(false)
const editData = ref({})

const handleConfirm = (data) => {
  console.log('提交的数据：', data)
  // 处理表单提交
}
</script>
```

**表单字段：**
- 行为 (必填): 下拉选择
- 积分值 (必填): 数字输入

---

### 3. PointsAdjustDialog (积分调整)
用于调整用户积分。

**使用示例：**

```vue
<template>
  <div>
    <el-button @click="showDialog = true">调整积分</el-button>
    
    <PointsAdjustDialog
      v-model="showDialog"
      :initial-points="9900"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PointsAdjustDialog from '@/components/PointsAdjustDialog.vue'

const showDialog = ref(false)

const handleConfirm = (data) => {
  console.log('调整积分：', data.adjustPoints)
  console.log('调整后积分：', data.newPoints)
  // 处理积分调整
}
</script>
```

**表单字段：**
- 初始积分 (只读): 显示当前积分
- 积分值修改 (必填): 数字输入，可正可负

---

### 4. TopicFormDialog (话题表单)
用于创建或编辑话题。

**使用示例：**

```vue
<template>
  <div>
    <el-button @click="showDialog = true">创建新话题</el-button>
    
    <TopicFormDialog
      v-model="showDialog"
      :title="isEdit ? '编辑话题' : '创建新话题'"
      :data="editData"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TopicFormDialog from '@/components/TopicFormDialog.vue'

const showDialog = ref(false)
const isEdit = ref(false)
const editData = ref({})

const handleConfirm = (data) => {
  console.log('提交的数据：', data)
  // 处理表单提交
}
</script>
```

**表单字段：**
- 封面图片: 图片上传 (≤5MB, png/jpg)
- 话题名称 (必填): 下拉选择
- 话题描述 (必填): 多行文本输入

---

### 5. ContentFormDialog (内容编辑)
用于编辑内容的部门和话题信息。

**使用示例：**

```vue
<template>
  <div>
    <el-button @click="showDialog = true">编辑</el-button>
    
    <ContentFormDialog
      v-model="showDialog"
      :data="editData"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ContentFormDialog from '@/components/ContentFormDialog.vue'

const showDialog = ref(false)
const editData = ref({
  department: '销售部',
  topic: '银行知识'
})

const handleConfirm = (data) => {
  console.log('提交的数据：', data)
  // 处理表单提交
}
</script>
```

**表单字段：**
- 解决部门 (必填): 文本输入
- 所属话题 (必填): 下拉选择

---

## 样式特点

所有弹框组件保持统一的设计风格：

1. **弹框样式**
   - 白色背景，8px 圆角
   - 标题栏带分隔线
   - 右上角关闭按钮 (X)

2. **表单样式**
   - 必填字段带红色星号 (*)
   - 输入框聚焦时边框变为橙色 (#fa8c16)
   - 统一的字段间距和对齐方式

3. **按钮样式**
   - 取消按钮: 白色背景，灰色边框
   - 确定按钮: 橙色背景 (#fa8c16)
   - Hover 效果: 确定按钮变为 #ff9d3d

4. **交互体验**
   - 自动表单验证
   - 关闭时自动重置表单
   - 支持 v-model 双向绑定

## 扩展使用

如果需要创建自定义表单弹框，可以直接使用 `FormDialog` 基础组件：

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
      <!-- 在这里添加自定义表单字段 -->
      <el-form-item label="字段名" prop="fieldName">
        <el-input v-model="formData.fieldName" />
      </el-form-item>
    </template>
  </FormDialog>
</template>
```



