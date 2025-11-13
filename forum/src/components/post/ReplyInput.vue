<template>
  <div 
    class="reply-input-wrapper" 
    :class="{ 'keyboard-active': isKeyboardActive }"
  >
    <!-- 输入区域 -->
    <div class="input-container">
      <!-- @提及信息 -->
      <div v-if="replyTo" class="reply-to-info">
        <span class="reply-to-text">回复 @{{ replyTo }}</span>
        <div class="close-reply" @click="$emit('cancel-reply')">
          <el-icon :size="14">
            <Close />
          </el-icon>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="input-box">
        <textarea
          ref="textareaRef"
          v-model="inputValue"
          class="text-input"
          :placeholder="placeholder"
          rows="1"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="adjustHeight"
        ></textarea>
      </div>

      <!-- 已上传图片预览 -->
      <div v-if="uploadedImages.length > 0" class="image-preview-area">
        <div
          v-for="(image, index) in uploadedImages"
          :key="index"
          class="image-preview-item"
        >
          <img :src="image" alt="预览图" />
          <div class="image-remove" @click="removeImage(index)">
            <el-icon :size="14">
              <Close />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 底部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="toolbar-item" @click="uploadImage">
            <img src="../../assets/images/icon/image.png" alt="上传图片" class="action-icon" width="20" height="20" />
          </div>
        </div>
        <button 
          class="send-btn" 
          :class="{ disabled: !canSend }"
          @click="handleSend"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Close, Picture } from '@element-plus/icons-vue'

interface Props {
  placeholder?: string
  replyTo?: string  // 回复的用户名
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '快写下你的想法吧！'
})

const emit = defineEmits<{
  'send': [data: { text: string, images: string[] }]
  'cancel-reply': []
  'focus': []
  'blur': []
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const inputValue = ref('')
const uploadedImages = ref<string[]>([])
const isKeyboardActive = ref(false)

// 是否可以发送
const canSend = computed(() => {
  return inputValue.value.trim() !== '' || uploadedImages.value.length > 0
})

// 聚焦处理
const handleFocus = () => {
  isKeyboardActive.value = true
  emit('focus')
}

// 失焦处理
const handleBlur = () => {
  setTimeout(() => {
    isKeyboardActive.value = false
    emit('blur')
  }, 100)
}

// 自动调整高度
const adjustHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

// 上传图片
const uploadImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    
    if (files) {
      Array.from(files).forEach(file => {
        if (uploadedImages.value.length >= 9) return
        
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            uploadedImages.value.push(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }
  
  input.click()
}

// 删除图片
const removeImage = (index: number) => {
  uploadedImages.value.splice(index, 1)
}

// 发送
const handleSend = () => {
  if (!canSend.value) return
  
  emit('send', {
    text: inputValue.value.trim(),
    images: [...uploadedImages.value]
  })
  
  // 清空输入
  inputValue.value = ''
  uploadedImages.value = []
  
  // 重置高度
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

// 聚焦输入框
const focus = () => {
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

// 暴露方法给父组件
defineExpose({
  focus
})
</script>

<style scoped>
.reply-input-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #F5F5F5;
  z-index: 100;
  transition: transform 0.3s ease;
}

.reply-input-wrapper.keyboard-active {
  transform: translateY(0);
}

.input-container {
  padding: 12px 16px;
  border-radius: 4px 4px 0px 0px;
  overflow: hidden;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

/* 回复信息 */
.reply-to-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #F7F7F7;
  border-radius: 8px;
  margin-bottom: 12px;
}

.reply-to-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666;
}

.close-reply {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: #999;
}

.close-reply:active {
  color: #666;
}

/* 输入框 */
.input-box {
  /* margin-bottom: 12px; */
}
.input-box textarea {

  background: #FFF;
}

.text-input {
  width: 100%;
  min-height: 36px;
  max-height: 120px;
  padding: 8px 12px;
  background: #F7F7F7;
  border: none;
  border-radius: 8px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
  line-height: 20px;
  resize: none;
  outline: none;
  overflow-y: auto;
}

.text-input::placeholder {
  color: #999;
}

/* 图片预览 */
.image-preview-area {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  /* margin-bottom: 12px; */
}

.image-preview-item {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-remove {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
}

/* 工具栏 */
.toolbar {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.toolbar-item:active {
  opacity: 0.6;
}

.send-btn {
  padding: 8px 24px;
  height: 36px;
  background: #FFDD00;
  color: #1A1A1A;
  border: none;
  border-radius: 18px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
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
</style>

