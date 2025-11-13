<template>
  <div 
    class="reply-input-wrapper" 
    :class="{ 'keyboard-active': isKeyboardActive }"
  >
    <!-- 黑色蒙层 -->
    <div class="overlay" @click="handleOverlayClick"></div>
    
    <!-- 输入区域 -->
    <div class="input-container">
      <!-- @提及信息或编辑提示 -->
      <!-- <div v-if="replyTo || isEditMode" class="reply-to-info">
        <span class="reply-to-text">{{ isEditMode ? '修改回答' : `回复 @${replyTo}` }}</span>
        <div class="close-reply" @click="handleOverlayClick">
          <el-icon :size="14">
            <Close />
          </el-icon>
        </div>
      </div> -->

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
          {{ isEditMode ? '修改' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { uploadImages } from '../../api/upload'

interface Props {
  placeholder?: string
  replyTo?: string  // 回复的用户名
  isEditMode?: boolean  // 是否是编辑模式
}

withDefaults(defineProps<Props>(), {
  placeholder: '快写下你的想法吧！',
  isEditMode: false
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
const uploading = ref(false)

// 是否可以发送
const canSend = computed(() => {
  return (inputValue.value.trim() !== '' || uploadedImages.value.length > 0) && !uploading.value
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
  
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    
    if (!files || files.length === 0) return
    
    // 检查数量限制
    if (uploadedImages.value.length + files.length > 9) {
      //ElMessage.warning('最多上传9张图片')
      return
    }
    
    try {
      uploading.value = true
      
      // 上传图片到服务器
      const fileArray = Array.from(files)
      const response = await uploadImages(fileArray)
      
      if (response.data.image_urls && response.data.image_urls.length > 0) {
        // 将上传成功的图片URL添加到列表
        uploadedImages.value.push(...response.data.image_urls)
        //ElMessage.success(`成功上传${response.data.success_count}张图片`)
      }
      
      if (response.data.error_count > 0) {
        //ElMessage.warning(`有${response.data.error_count}张图片上传失败`)
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      //ElMessage.error('图片上传失败，请重试')
    } finally {
      uploading.value = false
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

// 点击蒙层
const handleOverlayClick = () => {
  emit('cancel-reply')
  inputValue.value = ''
  uploadedImages.value = []
}

// 设置编辑内容（用于回填数据）
const setEditContent = (content: string, images: string[] = []) => {
  inputValue.value = content
  uploadedImages.value = [...images]
  nextTick(() => {
    adjustHeight()
    textareaRef.value?.focus()
  })
}

// 暴露方法给父组件
defineExpose({
  focus,
  setEditContent
})
</script>

<style scoped>
.reply-input-wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  z-index: 2001;
  display: flex !important;
  flex-direction: column;
  justify-content: flex-end;
  transition: transform 0.3s ease;
  pointer-events: auto;
}

.reply-input-wrapper.keyboard-active {
  transform: translateX(-50%) translateY(0);
}

/* 黑色蒙层 */
.overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 0;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.input-container {
  position: relative;
  padding: 0;
  border-radius: 4px 4px 0px 0px;
  overflow: hidden;
  padding-bottom: calc(env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #F5F5F5;
  z-index: 1;
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
  padding: 12px 16px;
  /* margin-bottom: 12px; */
}
.input-box textarea {

  background: #FFF;
}

.text-input {
  width: 100%;
  padding: 0;
  min-height: 36px;
  max-height: 30px;
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
  height: 48px;
  padding: 8px 16px;
  border-top: 1px solid #F5F5F5;
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

