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
          placeholder="搜索"
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
      <div v-if="loading" class="loading-wrapper">
        <el-icon class="is-loading" :size="32">
          <Loading />
        </el-icon>
        <div class="loading-text">搜索中...</div>
      </div>

      <!-- 搜索结果 -->
      <template v-else-if="searchResults.length > 0">
        <!-- 结果数量提示 -->
        <!-- <div class="results-count">
          找到 {{ totalCount }} 条相关结果
        </div> -->
        
        <div
          v-for="item in searchResults"
          :key="item.question_id"
          class="search-item"
          @click="handleResultClick(item)"
        >
          <el-icon class="item-icon" :size="20">
            <Search />
          </el-icon>
          <div class="item-text">
            <span class="keyword" v-html="highlightKeyword(item.title)"></span>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else class="empty-result">
        <div class="empty-icon">
          <img src="../../assets/images/empty/follow_empty.png" alt="暂无数据" width="130" height="130" />
        </div>
        <div class="empty-text">未找到"{{ searchKeyword }}"相关内容</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowLeft, CircleClose, Delete, Loading } from '@element-plus/icons-vue'
import { getQuestionList, type QuestionItem } from '@/api/question'

const router = useRouter()
const searchInputRef = ref<HTMLInputElement>()
const searchKeyword = ref('')
const searchResults = ref<QuestionItem[]>([])
const loading = ref(false)
const totalCount = ref(0)

// 搜索历史 - 从 localStorage 加载
const STORAGE_KEY = 'forum_search_history'
const searchHistory = ref<string[]>([])

// 加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEY)
    if (history) {
      searchHistory.value = JSON.parse(history)
    } else {
      // 默认搜索历史
      searchHistory.value = ['让客户满意', '提高服务质量的必要条件']
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
    searchHistory.value = ['让客户满意', '提高服务质量的必要条件']
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

// 执行搜索
const performSearch = async () => {
  const keyword = searchKeyword.value.trim()
  console.log('执行搜索, 关键词:', keyword)
  
  if (!keyword) {
    searchResults.value = []
    totalCount.value = 0
    return
  }

  loading.value = true
  console.log('开始加载...')
  
  try {
    const response = await getQuestionList({
      keyword: keyword,
      page: 1,
      page_size: 50
    })
    
    console.log('API返回:', response)
    // API返回的数据结构是 response.data.items
    searchResults.value = response.data?.items || []
    totalCount.value = response.data?.total || 0
    console.log('搜索结果数量:', searchResults.value.length, '总数:', totalCount.value)
  } catch (error: any) {
    console.error('搜索失败:', error)
    //ElMessage.error(error.message || '搜索失败，请稍后重试')
    searchResults.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
    console.log('加载完成, searchKeyword:', searchKeyword.value)
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  searchResults.value = []
  totalCount.value = 0
  searchInputRef.value?.focus()
}

// 处理搜索输入 - 使用防抖
let searchTimer: number | null = null
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  searchTimer = setTimeout(() => {
    performSearch()
  }, 500)
}

// 提交搜索
const handleSearchSubmit = () => {
  if (!searchKeyword.value.trim()) return
  
  // 添加到搜索历史
  addSearchHistory(searchKeyword.value.trim())
  
  // 立即执行搜索
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  performSearch()
}

// 高亮关键词
const highlightKeyword = (text: string) => {
  if (!searchKeyword.value.trim() || !text) return text
  
  const keyword = searchKeyword.value.trim()
  const regex = new RegExp(`(${keyword})`, 'gi')
  
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 点击搜索结果
const handleResultClick = (item: QuestionItem) => {
  console.log('点击搜索结果:', item)
  // 添加到搜索历史
  addSearchHistory(item.title)
  
  // 跳转到问题详情页
  router.push(`/post/${item.question_id}`)
}

// 页面加载时自动聚焦并加载历史
onMounted(() => {
  searchInputRef.value?.focus()
  loadSearchHistory()
})
</script>

<style scoped>
.search-page {
  width: 100%;
  background: #fff;
  overflow-x: hidden;
}

/* 顶部搜索栏 */
.search-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;  /* 2.5vw 4vw → 10px 16px */
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;  /* 3vw → 12px */
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  padding: 4px;  /* 1vw → 4px */
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
  padding: 8px 16px;  /* 2vw 4vw → 8px 16px */
  min-height: 40px;
}

.search-icon {
  flex-shrink: 0;
  margin-right: 8px;  /* 2vw → 8px */
  color: #999;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;  /* clamp(14px, 4vw, 15px) → 15px */
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

/* 搜索结果列表 */
.search-results {
  padding: 0;
}

/* 加载状态 */
.loading-wrapper {
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
.keyword :deep(.highlight) {
  color: #FFB800;
  font-weight: 600;
  border-radius: 2px;
}

/* 空状态 */
.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
}

.empty-icon {
  margin-bottom: 30px;
  animation: float 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon img {
  display: block;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #999;
  text-align: center;
  line-height: 1.6;
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
