<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="image-viewer" @click="handleClose">
        <div class="viewer-container">
          <img 
            v-if="currentImage" 
            :src="currentImage" 
            alt="查看图片" 
            class="viewer-image"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useImageViewerStore } from '../../stores/imageViewer'

const store = useImageViewerStore()

const visible = computed(() => store.visible)
const currentImage = computed(() => store.currentImage)

const handleClose = () => {
  store.close()
}
</script>

<style scoped>
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.viewer-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

