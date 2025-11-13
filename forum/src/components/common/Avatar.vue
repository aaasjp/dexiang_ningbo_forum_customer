<template>
  <div class="avatar-component" :style="avatarStyle">
    <img v-if="src" :src="src" :alt="name" class="avatar-img" />
    <span v-else class="avatar-text">{{ displayText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'Avatar'
})

interface Props {
  src?: string // 头像图片地址
  name?: string // 名称，用于生成文字头像
  size?: number | string // 头像大小（像素）
  fontSize?: number | string // 字体大小
  bgColor?: string // 背景色
  textColor?: string // 文字颜色
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  name: '',
  size: 40,
  fontSize: 0, // 0表示自动计算
  bgColor: '',
  textColor: '#FFFFFF'
})

// 预设的颜色数组 - 多种颜色供随机选择
const colorPalette: readonly string[] = [
  '#4A90E2', // 蓝色
  '#5CB85C', // 绿色
  '#F0AD4E', // 橙色
  '#D9534F', // 红色
  '#9B59B6', // 紫色
  '#1ABC9C', // 青色
  '#E74C3C', // 深红
  '#3498DB', // 天蓝
  '#2ECC71', // 翠绿
  '#F39C12', // 金橙
  '#E91E63', // 粉红
  '#FF5722', // 深橙
  '#009688', // 墨绿
  '#673AB7', // 深紫
  '#00BCD4', // 浅蓝
  '#8BC34A', // 浅绿
]

// 根据名称生成颜色索引（确保同一名称总是得到相同颜色）
const getColorFromName = (name: string): string => {
  if (!name) return colorPalette[0]!
  
  // 使用简单的哈希函数将名称转换为数字
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32bit integer
  }
  
  // 使用哈希值选择颜色
  const index = Math.abs(hash) % colorPalette.length
  return colorPalette[index]!
}

// 从名称中提取最后两个字
const displayText = computed(() => {
  if (!props.name) return '?'
  const nameStr = props.name.trim()
  if (nameStr.length <= 2) return nameStr
  return nameStr.slice(-2)
})

// 计算背景颜色
const computedBgColor = computed(() => {
  if (props.bgColor) return props.bgColor
  return getColorFromName(props.name)
})

// 计算字体大小（如果fontSize为0，则根据size自动计算）
const computedFontSize = computed(() => {
  if (props.fontSize && props.fontSize !== 0) {
    return typeof props.fontSize === 'number' ? `${props.fontSize}px` : props.fontSize
  }
  // 自动计算：字体大小为外框大小的 0.4 倍
  const sizeNum = typeof props.size === 'number' ? props.size : parseInt(props.size as string)
  return `${Math.round(sizeNum * 0.4)}px`
})

// 动态样式
const avatarStyle = computed(() => ({
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  fontSize: computedFontSize.value,
  backgroundColor: props.src ? 'transparent' : computedBgColor.value,
  color: props.textColor
}))
</script>

<style scoped>
.avatar-component {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  aspect-ratio: 1 / 1; /* 确保是正圆 */
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  font-weight: 600;
  user-select: none;
  line-height: 1;
  text-align: center;
}
</style>

