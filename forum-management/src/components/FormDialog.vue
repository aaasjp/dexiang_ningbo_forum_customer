<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="custom-dialog-overlay" @click.self="handleCancel">
      <div class="custom-dialog" :style="{ width: width }">
        <!-- Header -->
        <div class="custom-dialog-header">
          <div class="custom-dialog-title">{{ title }}</div>
          <button class="custom-dialog-close" @click="handleCancel">
            <svg viewBox="0 0 1024 1024" width="16" height="16">
              <path fill="currentColor" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path>
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="custom-dialog-body">
          <el-form 
            ref="formRef" 
            :model="formData" 
            :rules="rules" 
            label-width="auto"
            class="dialog-form"
          >
            <slot name="form" :form-data="formData"></slot>
          </el-form>
        </div>
        
        <!-- Footer -->
        <div class="custom-dialog-footer">
          <div class="dialog-footer">
            <el-button class="cancel-btn" @click="handleCancel">取消</el-button>
            <el-button class="confirm-btn" @click="handleConfirm">确定</el-button>
          </div>
        </div>
      </div>
    </div>
  </transition>
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

// 监听visible变化，关闭时重置表单
watch(visible, (newVal, oldVal) => {
  if (oldVal && !newVal) {
    handleClose()
  }
})
</script>

<style scoped>
/* 遮罩层 */
.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* 弹框主体 */
.custom-dialog {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.custom-dialog-header {
  padding: 20px 40px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.custom-dialog-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 24px;
}

.custom-dialog-close {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  transition: color 0.3s;
}

.custom-dialog-close:hover {
  color: #fa8c16;
}

/* Body */
.custom-dialog-body {
  padding: 40px 40px 40px;
  overflow-y: auto;
  flex: 1;
}

/* Footer */
.custom-dialog-footer {
  padding: 0 40px 40px;
  flex-shrink: 0;
}

/* 动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s;
}

.dialog-fade-enter-active .custom-dialog,
.dialog-fade-leave-active .custom-dialog {
  transition: transform 0.3s;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .custom-dialog,
.dialog-fade-leave-to .custom-dialog {
  transform: scale(0.9);
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
  width: 120px;
  height: 44px;
  background: #FAFAFA;
  border: none;
  color: #4D4D4D;
  border-radius: 4px;
  font-size: 14px;
}

.cancel-btn:hover {
  background: #F0F0F0;
}

.confirm-btn {
  width: 120px;
  height: 44px;
  background: #FF7800;
  border: none;
  color: #FFFFFF;
  border-radius: 4px;
  font-size: 14px;
}

.confirm-btn:hover {
  background: #FF8C1A;
}

.confirm-btn:active {
  background: #E66D00;
}
</style>



