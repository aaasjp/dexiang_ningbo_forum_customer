<template>
  <div class="infinite-scroll-wrapper" ref="wrapperRef">
    <!-- 下拉刷新区域 -->
    <div 
      v-if="enablePullRefresh" 
      class="pull-refresh-indicator"
      :class="{ 
        'pulling': pullStatus === 'pulling',
        'can-release': pullStatus === 'can-release',
        'refreshing': pullStatus === 'refreshing'
      }"
      :style="{ transform: `translateY(${pullDistance}px)` }"
    >
      <div class="refresh-icon">
        <span v-if="pullStatus === 'pulling'">↓</span>
        <span v-else-if="pullStatus === 'can-release'">↑</span>
        <span v-else class="loading-spinner">⟳</span>
      </div>
      <div class="refresh-text">
        {{ refreshText }}
      </div>
    </div>

    <!-- 列表内容插槽 -->
    <div class="scroll-content">
      <slot></slot>
    </div>

    <!-- 加载更多指示器 -->
    <div v-if="showLoadingMore" class="loading-more">
      <div class="loading-spinner">⟳</div>
      <span>{{ loadingText }}</span>
    </div>

    <!-- 没有更多数据提示 -->
    <div v-if="noMore && !loading" class="no-more">
      {{ noMoreText }}
    </div>

    <!-- 空状态 -->
    <div v-if="isEmpty && !loading" class="empty-state">
      <slot name="empty">
        <div class="empty-icon">{{ emptyIcon }}</div>
        <div class="empty-text">{{ emptyText }}</div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  // 是否正在加载
  loading?: boolean
  // 是否已加载完所有数据
  noMore?: boolean
  // 是否为空列表
  isEmpty?: boolean
  // 距离底部多少像素时触发加载
  distance?: number
  // 是否启用下拉刷新
  enablePullRefresh?: boolean
  // 下拉刷新触发距离
  pullRefreshDistance?: number
  // 自定义文案
  loadingText?: string
  noMoreText?: string
  emptyText?: string
  emptyIcon?: string
  pullingText?: string
  canReleaseText?: string
  refreshingText?: string
}

interface Emits {
  (e: 'load-more'): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  noMore: false,
  isEmpty: false,
  distance: 100,
  enablePullRefresh: false,
  pullRefreshDistance: 60,
  loadingText: '加载中...',
  noMoreText: '没有更多了',
  emptyText: '暂无数据',
  emptyIcon: '📭',
  pullingText: '下拉刷新',
  canReleaseText: '释放刷新',
  refreshingText: '刷新中...'
})

const emit = defineEmits<Emits>()

const wrapperRef = ref<HTMLElement>()
const isLoadingMore = ref(false)

// 下拉刷新相关状态
const pullStatus = ref<'idle' | 'pulling' | 'can-release' | 'refreshing'>('idle')
const pullDistance = ref(0)
const startY = ref(0)
const isPulling = ref(false)

// 显示加载更多指示器
const showLoadingMore = computed(() => {
  return props.loading && !props.isEmpty && !isLoadingMore.value
})

// 刷新文案
const refreshText = computed(() => {
  switch (pullStatus.value) {
    case 'pulling':
      return props.pullingText
    case 'can-release':
      return props.canReleaseText
    case 'refreshing':
      return props.refreshingText
    default:
      return props.pullingText
  }
})

// 检查是否触底
const checkReachBottom = () => {
  if (!wrapperRef.value) return false
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const clientHeight = window.innerHeight
  const scrollHeight = document.documentElement.scrollHeight
  
  return scrollHeight - (scrollTop + clientHeight) <= props.distance
}

// 滚动事件处理
const handleScroll = () => {
  // 如果正在加载或已加载完，不触发
  if (props.loading || props.noMore || props.isEmpty) return
  
  // 检查是否触底
  if (checkReachBottom()) {
    isLoadingMore.value = true
    emit('load-more')
  }
}

// 下拉刷新 - 触摸开始
const handleTouchStart = (e: TouchEvent) => {
  if (!props.enablePullRefresh || !e.touches || !e.touches[0]) return
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  
  // 只有在页面顶部才能触发下拉刷新
  if (scrollTop === 0) {
    startY.value = e.touches[0].clientY
    isPulling.value = true
  }
}

// 下拉刷新 - 触摸移动
const handleTouchMove = (e: TouchEvent) => {
  if (!props.enablePullRefresh || !isPulling.value || !e.touches || !e.touches[0]) return
  
  const currentY = e.touches[0].clientY
  const distance = currentY - startY.value
  
  // 只处理向下拉的情况
  if (distance > 0) {
    // 阻止默认滚动
    e.preventDefault()
    
    // 计算下拉距离（添加阻尼效果）
    pullDistance.value = Math.min(distance * 0.5, props.pullRefreshDistance * 1.5)
    
    // 更新状态
    if (pullDistance.value >= props.pullRefreshDistance) {
      pullStatus.value = 'can-release'
    } else {
      pullStatus.value = 'pulling'
    }
  }
}

// 下拉刷新 - 触摸结束
const handleTouchEnd = () => {
  if (!props.enablePullRefresh || !isPulling.value) return
  
  isPulling.value = false
  
  // 如果达到刷新距离，触发刷新
  if (pullStatus.value === 'can-release') {
    pullStatus.value = 'refreshing'
    pullDistance.value = props.pullRefreshDistance
    emit('refresh')
  } else {
    // 重置状态
    resetPullRefresh()
  }
}

// 重置下拉刷新状态
const resetPullRefresh = () => {
  pullStatus.value = 'idle'
  pullDistance.value = 0
}

// 监听 loading 变化，重置状态
watch(() => props.loading, (newVal) => {
  if (!newVal) {
    isLoadingMore.value = false
    
    // 如果是刷新完成，重置下拉刷新状态
    if (pullStatus.value === 'refreshing') {
      setTimeout(() => {
        resetPullRefresh()
      }, 300)
    }
  }
})

// 节流函数
const throttle = (func: Function, delay: number) => {
  let timer: number | null = null
  return function (this: any, ...args: any[]) {
    if (!timer) {
      timer = window.setTimeout(() => {
        func.apply(this, args)
        timer = null
      }, delay)
    }
  }
}

const throttledScroll = throttle(handleScroll, 200)

onMounted(() => {
  window.addEventListener('scroll', throttledScroll)
  
  if (props.enablePullRefresh) {
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', throttledScroll)
  
  if (props.enablePullRefresh) {
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
  }
})

// 暴露重置方法
defineExpose({
  resetPullRefresh
})
</script>

<style scoped>
.infinite-scroll-wrapper {
  position: relative;
}

/* 下拉刷新指示器 */
.pull-refresh-indicator {
  position: absolute;
  top: -60px;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.3s ease;
  z-index: 10;
}

.pull-refresh-indicator.refreshing {
  transition: transform 0.3s ease;
}

.refresh-icon {
  font-size: 20px;
  color: #666;
  transition: transform 0.3s ease;
}

.pull-refresh-indicator.can-release .refresh-icon {
  transform: rotate(180deg);
}

.refresh-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666;
}

/* 加载更多指示器 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #999;
}

.loading-spinner {
  display: inline-block;
  animation: rotate 1s linear infinite;
  font-size: 16px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 没有更多数据 */
.no-more {
  padding: 20px;
  text-align: center;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  min-height: 400px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #999;
}

.scroll-content {
  position: relative;
}
</style>

