<template>
  <div 
    v-if="visible"
    class="bottom-edit-wrapper" 
    :class="{ 'keyboard-active': isKeyboardActive }"
  >
    <!-- 遮罩层 -->
    <div class="overlay" @click="handleCancel"></div>
    
    <!-- 输入区域 -->
    <div class="input-container">
      <!-- 输入框和确认按钮在一行 -->
      <div class="input-box">
        <input
          ref="inputRef"
          v-model="inputValue"
          type="text"
          class="text-input"
          :placeholder="placeholder"
          :maxlength="maxLength"
          @focus="handleFocus"
          @blur="handleBlur"
          @keyup.enter="handleConfirm"
        />
        <button 
          class="send-btn" 
          :class="{ disabled: !canConfirm }"
          @click="handleConfirm"
        >
          发送
        </button>
      </div>
      <!-- 字数提示 -->
      <!-- <div class="char-count">{{ inputValue.length }}/{{ maxLength }}</div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface Props {
  visible: boolean
  title?: string
  placeholder?: string
  modelValue?: string
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '',
  placeholder: '请输入内容',
  modelValue: '',
  maxLength: 50
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': [value: string]
  'cancel': []
}>()

const inputRef = ref<HTMLInputElement>()
const inputValue = ref(props.modelValue)
const isKeyboardActive = ref(false)

// 是否可以确认
const canConfirm = computed(() => {
  return inputValue.value.trim() !== '' && inputValue.value.trim() !== props.modelValue
})

// 监听 visible 变化，自动聚焦
watch(() => props.visible, (newVal) => {
  if (newVal) {
    inputValue.value = props.modelValue
    nextTick(() => {
      inputRef.value?.focus()
    })
  } else {
    isKeyboardActive.value = false
  }
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})

// 聚焦处理
const handleFocus = () => {
  isKeyboardActive.value = true
}

// 失焦处理
const handleBlur = () => {
  setTimeout(() => {
    isKeyboardActive.value = false
  }, 100)
}

// 确认
const handleConfirm = () => {
  if (!canConfirm.value) return
  
  emit('confirm', inputValue.value.trim())
  emit('update:visible', false)
}

// 取消
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
.bottom-edit-wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 0;
}

.input-container {
  position: relative;
  background: #fff;
  border-top: 1px solid #F5F5F5;
  z-index: 1;
  transition: transform 0.3s ease;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.keyboard-active .input-container {
  transform: translateY(0);
}

/* 输入框容器 */
.input-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-input {
  flex: 1;
  height: 36px;
  padding: 0 16px;
  background: #F7F7F7;
  border: none;
  border-radius: 20px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
  outline: none;
}

.text-input:focus {
  background: #F0F0F0;
}

.text-input::placeholder {
  color: #999;
}

/* 发送按钮 */
.send-btn {
  flex-shrink: 0;
  padding: 0 16px;
  height: 36px;
  background: #FFDD00;
  color: #1A1A1A;
  border: none;
  border-radius: 20px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.send-btn:active {
  transform: scale(0.95);
}

.send-btn.disabled {
  background: #F7F7F7;
  color: #999;
  cursor: not-allowed;
}

.send-btn.disabled:active {
  transform: none;
}

/* 字数提示 */
.char-count {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 8px;
  padding-right: 4px;
}
</style>

