<template>
  <el-dialog
    v-model="visible"
    width="420px"
    :show-close="false"
    class="delete-confirm-dialog"
  >
    <div class="dialog-content">
      <div class="icon-wrapper">
        <el-icon class="warning-icon" :size="24">
          <WarningFilled />
        </el-icon>
      </div>
      <div class="message">
        <span class="message-text">{{ message }}</span>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button class="cancel-btn" @click="handleCancel">取消</el-button>
        <el-button class="confirm-btn" type="warning" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: '确定删除该任务吗？'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const visible = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleConfirm = () => {
  emit('confirm')
  visible.value = false
}

const handleCancel = () => {
  emit('cancel')
  visible.value = false
}
</script>

<style scoped>
.delete-confirm-dialog :deep(.el-dialog) {
  border-radius: 8px;
  padding: 0;
}

.delete-confirm-dialog :deep(.el-dialog__header) {
  display: none;
}

.delete-confirm-dialog :deep(.el-dialog__body) {
  padding: 32px 24px 24px;
}

.delete-confirm-dialog :deep(.el-dialog__footer) {
  padding: 0 24px 24px;
}

.dialog-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.icon-wrapper {
  flex-shrink: 0;
}

.warning-icon {
  color: #fa8c16;
  font-size: 24px;
}

.message {
  flex: 1;
  padding-top: 2px;
}

.message-text {
  font-size: 16px;
  color: #1a1a1a;
  line-height: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  min-width: 80px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  color: #1a1a1a;
  border-radius: 4px;
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
}

.confirm-btn:hover {
  background: #ff9d3d;
}

.confirm-btn:active {
  background: #d87a0f;
}
</style>

