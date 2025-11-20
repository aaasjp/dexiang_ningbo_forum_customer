<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')" @touchmove.self.prevent>
    <div class="modal-content topic-modal">
      <div class="modal-header">
        <div class="modal-title">添加话题</div>
      </div>
      <div class="search-box">
        <el-icon :size="18" class="search-icon">
          <Search />
        </el-icon>
        <input
          v-model="searchText"
          type="text"
          placeholder="搜索话题"
          class="search-input"
        />
      </div>
      <div class="topic-list">
        <div
          v-for="topic in filteredTopics"
          :key="topic.topic_id"
          class="topic-item"
          @click="handleSelectTopic(topic.title)"
        >
          <div class="topic-name">
            <span class="topic-hash">#</span>
            {{ topic.title }}
          </div>
          <div class="topic-count">{{ formatCount(topic.question_count) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { Topic } from '@/api/topic'
import { searchTopics } from '@/api/topic'

interface Props {
  show: boolean
  topics: Topic[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  select: [topicName: string]
}>()

// 记录滚动位置
const scrollTop = ref(0)

// 监听显示状态，锁定背景滚动
watch(() => props.show, (newVal) => {
  if (newVal) {
    scrollTop.value = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollTop.value}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    window.scrollTo(0, scrollTop.value)
  }
})

// 组件卸载时恢复背景滚动
onUnmounted(() => {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  if (props.show) {
    window.scrollTo(0, scrollTop.value)
  }
})

const searchText = ref('')
const searchResults = ref<Topic[]>([])
const isSearching = ref(false)
let searchTimer: number | null = null

// 格式化讨论数量
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}w讨论`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k讨论`
  } else {
    return `${count}讨论`
  }
}

// 搜索话题
const performSearch = async (keyword: string) => {
  if (!keyword.trim()) {
    searchResults.value = []
    return
  }

  try {
    isSearching.value = true
    const response = await searchTopics(keyword, 1, 20)
    searchResults.value = response.data.items
  } catch (error) {
    console.error('搜索话题失败:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// 监听搜索文本变化，使用防抖
watch(searchText, (newValue) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  searchTimer = window.setTimeout(() => {
    performSearch(newValue)
  }, 300)
})

// 显示的话题列表：如果有搜索文本，显示搜索结果；否则显示默认话题列表
const filteredTopics = computed(() => {
  if (searchText.value.trim()) {
    return searchResults.value
  }
  return props.topics
})

// 选择话题
const handleSelectTopic = (topicName: string) => {
  emit('select', topicName)
}
</script>

<style scoped>
/* 弹窗遮罩 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 100vw;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
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

.modal-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #F5F5F5;
}

.modal-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 16px;
  color: #1A1A1A;
}

/* 搜索框 */
.search-box {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F7F7F7;
  margin: 12px 16px;
  border-radius: 20px;
}

.search-icon {
  color: #999;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
}

.search-input::placeholder {
  color: #999;
}

/* 话题列表 */
.topic-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
  /* 防止 iOS 滚动穿透和回弹 */
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}

.topic-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #F5F5F5;
  cursor: pointer;
}

.topic-item:last-child {
  border-bottom: none;
}

.topic-item:active {
  background: #FAFAFA;
}

.topic-name {
  flex: 1;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
}

.topic-hash {
  color: #FFDD00;
  font-weight: 600;
  margin-right: 4px;
}

.topic-count {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999;
}
</style>

