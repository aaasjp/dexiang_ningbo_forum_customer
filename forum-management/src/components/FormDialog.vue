<template>
  <el-dialog
    v-model="visible"
    :width="width"
    :title="title"
    class="form-dialog"
    @close="handleClose"
  >
    <el-form 
      ref="formRef" 
      :model="formData" 
      :rules="rules" 
      label-width="auto"
      class="dialog-form"
    >
      <slot name="form" :form-data="formData"></slot>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button class="cancel-btn" @click="handleCancel">取消</el-button>
        <el-button class="confirm-btn" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '620px'
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  rules: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close'])

const visible = ref(props.modelValue)
const formRef = ref(null)

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleConfirm = async () => {
  if (!formRef.value) {
    emit('confirm', props.formData)
    visible.value = false
    return
  }
  
  try {
    await formRef.value.validate()
    emit('confirm', props.formData)
    visible.value = false
  } catch (error) {
    console.log('表单验证失败', error)
  }
}

const handleCancel = () => {
  emit('cancel')
  visible.value = false
}

const handleClose = () => {
  emit('close')
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.form-dialog :deep(.el-dialog) {
  border-radius: 8px;
  padding: 0;
}

.form-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  margin: 0;
}

.form-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.form-dialog :deep(.el-dialog__headerbtn) {
  top: 20px;
  right: 24px;
  width: 24px;
  height: 24px;
  font-size: 16px;
}

.form-dialog :deep(.el-dialog__close) {
  color: #999999;
}

.form-dialog :deep(.el-dialog__close:hover) {
  color: #fa8c16;
}

.form-dialog :deep(.el-dialog__body) {
  padding: 32px 24px 24px;
}

.form-dialog :deep(.el-dialog__footer) {
  padding: 0 24px 24px;
  border-top: 1px solid #f0f0f0;
  margin-top: 24px;
}

.dialog-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.dialog-form :deep(.el-form-item__label) {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 400;
  padding-right: 12px;
}

.dialog-form :deep(.el-form-item.is-required:not(.is-no-asterisk)>.el-form-item__label:before) {
  color: #ff4d4f;
  margin-right: 4px;
}

.dialog-form :deep(.el-input__wrapper) {
  border-radius: 4px;
  box-shadow: 0 0 0 1px #d9d9d9 inset;
  padding: 8px 12px;
}

.dialog-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #fa8c16 inset;
}

.dialog-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #fa8c16 inset;
}

.dialog-form :deep(.el-input__inner) {
  color: #1a1a1a;
  font-size: 14px;
}

.dialog-form :deep(.el-input__inner::placeholder) {
  color: #bfbfbf;
}

.dialog-form :deep(.el-select) {
  width: 100%;
}

.dialog-form :deep(.el-textarea__inner) {
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  padding: 8px 12px;
  font-size: 14px;
  color: #1a1a1a;
}

.dialog-form :deep(.el-textarea__inner:hover) {
  border-color: #fa8c16;
}

.dialog-form :deep(.el-textarea__inner:focus) {
  border-color: #fa8c16;
  outline: none;
}

.dialog-form :deep(.el-textarea__inner::placeholder) {
  color: #bfbfbf;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
}

.cancel-btn {
  min-width: 80px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  color: #1a1a1a;
  border-radius: 4px;
  font-size: 14px;
}

.cancel-btn:hover {
  color: #fa8c16;
  border-color: #fa8c16;
  background: #ffffff;
}

.confirm-btn {
  min-width: 80px;
  height: 36px;
  background: #fa8c16;
  border: none;
  color: #ffffff;
  border-radius: 4px;
  font-size: 14px;
}

.confirm-btn:hover {
  background: #ff9d3d;
}

.confirm-btn:active {
  background: #d87a0f;
}
</style>



