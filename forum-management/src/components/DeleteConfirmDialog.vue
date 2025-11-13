<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="custom-dialog-overlay" @click.self="handleCancel">
      <div class="custom-dialog" :style="{ width: width }">
        <!-- Body（无标题栏，无分割线，padding 40px） -->
        <div class="custom-dialog-body">
          <!-- 标题独立显示 -->
          <div class="confirm-title">{{ title }}</div>
          
          <!-- 图标与消息内容 -->
          <div class="confirm-content" v-if="message">
            <div class="confirm-icon">
              <!-- 警告图标 -->
              <svg viewBox="0 0 1024 1024" width="24" height="24">
                <path fill="#faad14" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z"></path>
              </svg>
            </div>
            
            <div class="confirm-message">{{ message }}</div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="custom-dialog-footer">
          <div class="dialog-footer">
            <el-button class="cancel-btn" @click="handleCancel">{{ cancelText }}</el-button>
            <el-button class="confirm-btn" @click="handleConfirm">{{ confirmText }}</el-button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '删除确认',
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '420px'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
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

/* Body - 无标题栏，无分割线，padding 40px */
.custom-dialog-body {
  padding: 40px;
  overflow-y: auto;
  flex: 1;
}

/* 标题独立在顶部 */
.confirm-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 24px;
  margin-bottom: 26px;
}

/* 图标与消息内容区域 */
.confirm-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.confirm-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-message {
  flex: 1;
  font-size: 14px;
  color: #595959;
  line-height: 22px;
  word-break: break-word;
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

