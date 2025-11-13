<template>
  <div class="topic-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="header-title">话题广场</div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar" @click="goToSearch">
      <el-icon class="search-icon" :size="18">
        <Search />
      </el-icon>
      <input 
        type="text" 
        placeholder="搜索话题" 
        readonly
      />
    </div>

    <!-- 话题列表 -->
    <div class="content">
      <div 
        class="topic-item" 
        v-for="(topic, index) in displayTopics" 
        :key="topic.topic_id" 
        @click="goToDetail(topic.topic_id)"
      >
        <!-- 排名标识 -->
        <div class="topic-rank">
          <div 
            class="rank-badge"
            :class="{
              'rank-1': index === 0,
              'rank-2': index === 1,
              'rank-3': index === 2,
              'rank-other': index >= 3
            }"
          >
            {{ index + 1 }}
          </div>
        </div>

        <!-- 话题信息 -->
        <div class="topic-info">
          <div class="topic-name">#{{ topic.title }}</div>
        </div>

        <!-- 参与数量 -->
        <div class="topic-stats">
          {{ formatCount(topic.question_count) }}参与
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="displayTopics.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">未找到相关话题</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getTopicList } from '../../api/topic'
import type { Topic } from '../../api/topic'

const router = useRouter()

// 加载状态
const loading = ref(false)

// 获取所有话题
const allTopics = ref<Topic[]>([])

// 显示的话题列表
const displayTopics = computed(() => {
  return allTopics.value
})

// 加载话题列表
const loadTopics = async () => {
  try {
    loading.value = true
    const response = await getTopicList(1, 100)
    allTopics.value = response.data.items
  } catch (error) {
    console.error('加载话题列表失败:', error)
    ElMessage.error('加载话题列表失败')
  } finally {
    loading.value = false
  }
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

// 跳转到搜索页
const goToSearch = () => {
  router.push('/search/topic')
}

// 跳转到话题详情
const goToDetail = (id: number) => {
  router.push(`/topic/${id}`)
}

// 组件挂载时加载数据
onMounted(() => {
  loadTopics()
})
</script>

<style scoped>
.topic-page {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  background: #F5F5F5;
  overflow-x: hidden;
}

/* 顶部导航 */
.header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #1A1A1A;
  text-align: center;
}

/* 搜索栏 */
.search-bar {
  background: #fff;
  padding: 8px 16px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  cursor: pointer;
}

.search-icon {
  color: #999;
  position: absolute;
  left: 28px;
  pointer-events: none;
}

.search-bar input {
  flex: 1;
  height: 36px;
  padding: 0 12px 0 36px;
  background: #F7F7F7;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  color: #333;
  outline: none;
  cursor: pointer;
  pointer-events: none;
}

.search-bar input::placeholder {
  color: #999;
}

/* 内容区域 */
.content {
  background: #fff;
  padding: 0;
}

/* 话题项 */
.topic-item {
  display: flex;
  align-items: center;
  padding: 14px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  /* border-bottom: 1px solid #F5F5F5; */
  gap: 12px;
}

.topic-item:active {
  background: #FAFAFA;
}

.topic-item:last-child {
  border-bottom: none;
}

/* 排名标识 */
.topic-rank {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.rank-badge {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
}

.rank-1 {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.rank-2 {
  background: linear-gradient(135deg, #FFA726 0%, #FF9800 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 167, 38, 0.3);
}

.rank-3 {
  background: linear-gradient(135deg, #FFEB3B 0%, #FDD835 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(253, 216, 53, 0.3);
}

.rank-other {
  width: 20px;
  height: 20px;
  background: #F0F0F0;
  border-radius: 50%;
  color: #CCCCCC;
  font-weight: 400;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 话题信息 */
.topic-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.topic-name {
  height: 22px;
font-family: PingFang SC, PingFang SC;
font-weight: 600;
font-size: 16px;
color: #1A1A1A;
text-align: left;
font-style: normal;
text-transform: none;
line-height: 22px;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;

}

/* 参与数量 */
.topic-stats {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #999999;
  flex-shrink: 0;
  white-space: nowrap;
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
  font-size: 14px;
  color: #999;
}
</style>

