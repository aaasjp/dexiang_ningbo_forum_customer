<template>
  <div class="search-page">
    <!-- 顶部搜索栏 -->
    <div class="search-header">
      <button class="back-btn" @click="goBack">
        <el-icon :size="24">
          <ArrowLeft />
        </el-icon>
      </button>
      <div class="search-input-wrapper">
        <el-icon class="search-icon" :size="20">
          <Search />
        </el-icon>
        <input
          ref="searchInputRef"
          type="text"
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索话题"
          @input="handleSearch"
          @keyup.enter="handleSearchSubmit"
        />
        <button 
          v-if="searchKeyword" 
          class="clear-btn"
          @click="clearSearch"
        >
          <el-icon :size="16">
            <CircleClose />
          </el-icon>
        </button>
      </div>
    </div>

    <!-- 搜索历史 -->
    <div v-if="!searchKeyword && searchHistory.length > 0" class="search-history">
      <div class="history-header">
        <div class="history-title">搜索历史</div>
        <button class="clear-history-btn" @click="clearHistory">
          <el-icon :size="18">
            <Delete />
          </el-icon>
        </button>
      </div>
      <div class="history-tags">
        <div
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-tag"
          @click="selectHistoryItem(item)"
        >
          {{ item }}
        </div>
      </div>
    </div>

    <!-- 搜索结果列表 -->
    <div class="search-results" v-if="searchKeyword">
      <!-- 加载状态 -->
      <div v-if="isSearching" class="loading-state">
        <el-icon class="is-loading" :size="24">
          <Loading />
        </el-icon>
        <div class="loading-text">搜索中...</div>
      </div>

      <!-- 结果数量提示 -->
      <!-- <div v-else-if="searchResults.length > 0" class="results-count">
        找到 {{ searchResults.length }} 个相关话题
      </div> -->
      
      <div
        v-for="item in searchResults"
        :key="item.topic_id"
        class="search-item"
        @click="handleResultClick(item)"
      >
        <el-icon class="item-icon" :size="20">
          <Search />
        </el-icon>
        <div class="item-text">
          <div class="keyword-line">
            <span class="keyword"><span v-html="highlightKeyword(item.title)"></span></span>
            <div class="stats">{{ formatCount(item.question_count) }}参与</div>
          </div>
          <!-- <div v-if="item.description" class="description" v-html="highlightKeyword(item.description)"></div> -->
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!isSearching && searchKeyword && searchResults.length === 0" class="empty-result">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">未找到"{{ searchKeyword }}"相关话题</div>
        <div class="empty-hint">换个关键词试试吧</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowLeft, CircleClose, Delete, Loading } from '@element-plus/icons-vue'
import { searchTopics } from '../../api/topic'
import type { Topic } from '../../api/topic'

const router = useRouter()
const searchInputRef = ref<HTMLInputElement>()
const searchKeyword = ref('')
const isSearching = ref(false)
const searchResults = ref<Topic[]>([])
let searchTimer: number | null = null

// 搜索历史 - 从 localStorage 加载
const STORAGE_KEY = 'forum_topic_search_history'
const searchHistory = ref<string[]>([])

// 加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEY)
    if (history) {
      searchHistory.value = JSON.parse(history)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

// 保存搜索历史
const saveSearchHistory = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

// 添加搜索历史
const addSearchHistory = (keyword: string) => {
  if (!keyword.trim()) return
  
  // 移除重复项
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  
  // 添加到开头
  searchHistory.value.unshift(keyword)
  
  // 限制历史记录数量为 10 条
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  
  saveSearchHistory()
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  saveSearchHistory()
}

// 选择历史记录项
const selectHistoryItem = (keyword: string) => {
  searchKeyword.value = keyword
  handleSearchSubmit()
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  searchResults.value = []
  searchInputRef.value?.focus()
}

// 执行搜索
const performSearch = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  try {
    isSearching.value = true
    const response = await searchTopics(searchKeyword.value.trim(), 1, 100)
    searchResults.value = response.data.items || []
  } catch (error) {
    console.error('搜索话题失败:', error)
    searchResults.value = []
    //ElMessage.error('搜索失败，请稍后重试')
  } finally {
    isSearching.value = false
  }
}

// 处理搜索输入 - 防抖
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  searchTimer = setTimeout(() => {
    performSearch()
  }, 300)
}

// 提交搜索
const handleSearchSubmit = () => {
  if (!searchKeyword.value.trim()) return
  
  // 清除防抖定时器，立即搜索
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  // 添加到搜索历史
  addSearchHistory(searchKeyword.value.trim())
  
  // 执行搜索
  performSearch()
}

// 高亮关键词
const highlightKeyword = (text: string) => {
  if (!searchKeyword.value.trim() || !text) return text
  
  const keyword = searchKeyword.value.trim()
  // 转义特殊字符
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedKeyword})`, 'gi')
  
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 格式化数字
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 点击搜索结果
const handleResultClick = (item: Topic) => {
  console.log('点击话题:', item)
  // 添加到搜索历史
  addSearchHistory(item.title)
  
  // 跳转到话题详情页
  router.push(`/topic/${item.topic_id}`)
}

// 监听搜索关键词变化
watch(searchKeyword, (newVal) => {
  if (!newVal.trim()) {
    searchResults.value = []
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
  }
})

// 页面加载时自动聚焦并加载历史
onMounted(() => {
  searchInputRef.value?.focus()
  loadSearchHistory()
})
</script>

<style scoped>
.search-page {
  width: 100%;
  min-height: 100vh;
  background: #fff;
  overflow-x: hidden;
}

/* 顶部搜索栏 */
.search-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 8px 16px;
  min-height: 40px;
}

.search-icon {
  flex-shrink: 0;
  margin-right: 8px;
  color: #999;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  outline: none;
  color: #333;
  min-width: 0;
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.loading-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #999;
}

/* 搜索结果列表 */
.search-results {
  padding: 0;
}

/* 结果数量提示 */
.results-count {
  padding: 12px 16px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #999;
  background: #FAFAFA;
}

.search-item {
  display: flex;
  padding: 12px 16px;
  align-items: flex-start;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
  background: #FFFFFF;
}

.search-item:active {
  background: #fafafa;
}

.item-icon {
  flex-shrink: 0;
  margin-right: 12px;
  margin-top: 2px;
  color: #999;
}

.item-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.keyword-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.keyword {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
  word-wrap: break-word;
  word-break: break-word;
  flex: 1;
  line-height: 1.4;
}

/* 高亮匹配的关键词 */
.keyword :deep(.highlight),
.description :deep(.highlight) {
  color: #FFB800;
  font-weight: 600;
  /* background: rgba(255, 184, 0, 0.1); */
  /* padding: 0 2px; */
  border-radius: 2px;
}

/* 类型标签 */
.type-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  background: rgba(255, 221, 0, 0.15);
  border: 1px solid rgba(255, 221, 0, 0.3);
  border-radius: 10px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 11px;
  color: #D4A000;
  white-space: nowrap;
}

.description {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #999;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.5;
}

.stats {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999;
}

/* 空状态 */
.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #666;
  margin-bottom: 8px;
}

.empty-hint {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #999;
}

/* 搜索历史 */
.search-history {
  padding: 16px;
  background: #fff;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 16px;
  color: #1A1A1A;
}

.clear-history-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: color 0.2s;
}

.clear-history-btn:active {
  color: #666;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.history-tag {
  padding: 8px 16px;
  background: #F7F7F7;
  border-radius: 20px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.history-tag:active {
  background: #EFEFEF;
  transform: scale(0.95);
}
</style>

