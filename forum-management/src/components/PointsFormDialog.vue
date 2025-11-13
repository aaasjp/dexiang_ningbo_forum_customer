<template>
  <FormDialog
    v-model="visible"
    :title="title"
    :form-data="formData"
    :rules="formRules"
    width="680px"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
    label-position="top"
  >
    <template #form="{ formData }">
      <el-form-item label="行为" class="vertical-form-item" label-position="top">
        <el-input 
          v-model="formData.action" 
          placeholder="请输入行为"
          disabled
        />
      </el-form-item>
      
      <el-form-item label="积分值" prop="points" class="vertical-form-item" label-position="top">
        <el-input 
          v-model.number="formData.points" 
          placeholder="请输入积分"
          type="number"
        />
      </el-form-item>
    </template>
  </FormDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import FormDialog from './FormDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '新增'
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formData = ref({
  action: '',
  points: null
})

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal && props.data) {
    formData.value = { ...props.data }
  }
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

const formRules = {
  points: [
    { required: true, message: '请输入积分值', trigger: 'blur' },
    { type: 'number', message: '积分值必须是数字', trigger: 'blur' }
  ]
}

const handleConfirm = (data) => {
  emit('confirm', data)
}

const handleCancel = () => {
  visible.value = false
}

const handleClose = () => {
  formData.value = {
    action: '',
    points: null
  }
}
</script>

<style scoped>
/* 垂直布局的表单项 */
.vertical-form-item :deep(.el-form-item__label) {
  display: block;
  text-align: left;
  margin-bottom: 8px;
  line-height: 22px;
}

.vertical-form-item :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

/* 确保输入框高度为 44px */
.vertical-form-item :deep(.el-input__wrapper) {
  height: 44px;
}

.vertical-form-item :deep(.el-input__inner) {
  height: 44px;
  line-height: 44px;
}
</style>



