import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImageViewerStore = defineStore('imageViewer', () => {
  const visible = ref(false)
  const currentImage = ref('')

  const open = (imageUrl: string) => {
    currentImage.value = imageUrl
    visible.value = true
  }

  const close = () => {
    visible.value = false
    // 延迟清除图片，等待动画完成
    setTimeout(() => {
      currentImage.value = ''
    }, 300)
  }

  return {
    visible,
    currentImage,
    open,
    close
  }
})

