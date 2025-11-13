<template>
  <div class="bottom-fixed" :class="{ 'keyboard-active': isKeyboardActive }">
    <!-- 底部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-item" @click="$emit('upload-image')">
        <img src="../../assets/images/icon/image.png" alt="上传图片" class="action-icon" width="20" height="20" />
      </div>
      <div class="toolbar-item" @click="$emit('open-topic-modal')">
        <img src="../../assets/images/icon/subject.png" alt="添加话题" class="action-icon" width="20" height="20" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isKeyboardActive: boolean
}

defineProps<Props>()
defineEmits<{
  'upload-image': []
  'open-topic-modal': []
}>()
</script>

<style scoped>
.bottom-fixed {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  background: #fff;
  z-index: 100;
  transition: transform 0.3s ease;
}

.bottom-fixed.keyboard-active {
  transform: translateX(-50%) translateY(0);
}

.toolbar {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  gap: 24px;
  border-top: 1px solid #F5F5F5;
}

.toolbar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
}

.toolbar-item:active {
  color: #333;
}
</style>

