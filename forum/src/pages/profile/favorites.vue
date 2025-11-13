<template>
  <div class="favorites-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="header-title">收藏</div>
    </div>

    <!-- Tab 切换 -->
    <div class="tabs">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'answers' }"
        @click="activeTab = 'answers'"
      >
        回答
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'topics' }"
        @click="activeTab = 'topics'"
      >
        话题
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 回答列表 -->
      <div v-if="activeTab === 'answers'" class="answers-list">
        <div v-if="answersLoading" class="loading">加载中...</div>
        <div v-else-if="favoriteAnswers.length === 0" class="empty">暂无收藏</div>
        <div
          v-else
          v-for="item in favoriteAnswers"
          :key="item.id"
          class="answer-card"
          @click="handleAnswerClick(item)"
        >
          <!-- 用户信息 -->
          <div class="answer-header">
            <div class="user-avatar">👤</div>
            <div class="user-info">
              <div class="user-name">{{ item.type === 'answer' ? item.answerer_name : '匿名用户' }}</div>
              <div class="answer-tag">{{ item.category || '回答' }}</div>
            </div>
            <button class="cancel-collect-btn" @click.stop="handleCancelCollect(item)">取消收藏</button>
          </div>

          <!-- 问题标题 -->
          <div class="question-title">{{ item.type === 'question' ? item.title : item.question_title }}</div>

          <!-- 回答内容 -->
          <div class="answer-content">{{ item.content }}</div>

          <!-- 统计信息 -->
          <div class="answer-stats">
            <span class="stat-item">{{ item.like_count }}赞</span>
            <span class="stat-item">{{ formatCount(item.view_count) }}浏览量</span>
          </div>
        </div>
      </div>

      <!-- 话题列表 -->
      <div v-else class="topics-list">
        <div v-if="topicsLoading" class="loading">加载中...</div>
        <div v-else-if="favoriteTopics.length === 0" class="empty">暂无收藏</div>
        <div
          v-else
          v-for="topic in favoriteTopics"
          :key="topic.topic_id"
          class="topic-card"
          @click="handleTopicClick(topic)"
        >
          <!-- 话题图标 -->
          <div class="topic-icon-wrapper">
            <div class="topic-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              #
            </div>
          </div>

          <!-- 话题信息 -->
          <div class="topic-info">
            <div class="topic-name"># {{ topic.title }}</div>
            <div class="topic-stats">
              {{ formatCount(topic.question_count) }}篇内容
            </div>
          </div>

          <!-- 取消收藏按钮 -->
          <button class="cancel-collect-btn" @click.stop="handleCancelTopicCollect(topic)">取消收藏</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMyFavorites, type FavoriteItem } from '../../api/question'
import { getMyFavoriteTopics, type Topic } from '../../api/topic'

const router = useRouter()
const activeTab = ref<'answers' | 'topics'>('answers')

// 收藏的回答数据
const favoriteAnswers = ref<FavoriteItem[]>([])
const answersLoading = ref(false)

// 收藏的话题数据
const favoriteTopics = ref<Topic[]>([])
const topicsLoading = ref(false)

// 加载收藏的回答和问题
const loadFavoriteAnswers = async () => {
  try {
    answersLoading.value = true
    const res = await getMyFavorites(1, 20)
    if (res.code === 200) {
      favoriteAnswers.value = res.data.items
    } else {
      ElMessage.error(res.message || '获取收藏失败')
    }
  } catch (error) {
    console.error('获取收藏失败:', error)
    ElMessage.error('获取收藏失败')
  } finally {
    answersLoading.value = false
  }
}

// 加载收藏的话题
const loadFavoriteTopics = async () => {
  try {
    topicsLoading.value = true
    const res = await getMyFavoriteTopics(1, 20)
    if (res.code === 200) {
      favoriteTopics.value = res.data.items
    } else {
      ElMessage.error(res.message || '获取话题失败')
    }
  } catch (error) {
    console.error('获取话题失败:', error)
    ElMessage.error('获取话题失败')
  } finally {
    topicsLoading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadFavoriteAnswers()
  loadFavoriteTopics()
})

// 格式化数字
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1).replace('.0', '') + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1).replace('.0', '') + 'k'
  }
  return count.toString()
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 处理回答点击
const handleAnswerClick = (item: FavoriteItem) => {
  if (item.type === 'question') {
    router.push(`/post/detail?id=${item.id}`)
  } else {
    // 跳转到问题详情页，并定位到该回答
    router.push(`/post/detail?id=${item.question_id}`)
  }
}

// 处理话题点击
const handleTopicClick = (topic: Topic) => {
  router.push(`/topic/detail?id=${topic.topic_id}`)
}

// 取消收藏回答/问题
const handleCancelCollect = async (item: FavoriteItem) => {
  try {
    // 根据类型调用不同的取消收藏接口
    if (item.type === 'question') {
      const { toggleFavoriteQuestion } = await import('../../api/question')
      await toggleFavoriteQuestion(item.id)
    } else {
      const { toggleFavoriteAnswer } = await import('../../api/answer')
      await toggleFavoriteAnswer(item.id)
    }
    ElMessage.success('已取消收藏')
    // 重新加载列表
    loadFavoriteAnswers()
  } catch (error) {
    console.error('取消收藏失败:', error)
    ElMessage.error('取消收藏失败')
  }
}

// 取消收藏话题
const handleCancelTopicCollect = async (topic: Topic) => {
  try {
    const { toggleFavoriteTopic } = await import('../../api/topic')
    await toggleFavoriteTopic(topic.topic_id)
    ElMessage.success('已取消收藏')
    // 重新加载列表
    loadFavoriteTopics()
  } catch (error) {
    console.error('取消收藏失败:', error)
    ElMessage.error('取消收藏失败')
  }
}
</script>

<style scoped>
.favorites-page {
  width: 100%;
  
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
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #F5F5F5;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333;
  flex-shrink: 0;
}

.header-title {
  flex: 1;
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #1A1A1A;
  text-align: center;
  margin-right: 20px;
}

/* Tab 切换 */
.tabs {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #F5F5F5;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  cursor: pointer;
  position: relative;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 15px;
  color: #666;
  transition: all 0.3s;
}

.tab-item.active {
  color: #1A1A1A;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 4px;
  background: #FFD700;
  border-radius: 2px;
}

/* 内容区域 */
.content {
  padding: 0;
}

/* 回答列表 */
.answers-list {
  background: #fff;
}

.answer-card {
  padding: 16px;
  border-bottom: 1px solid #F5F5F5;
  cursor: pointer;
  transition: background 0.2s;
}

.answer-card:active {
  background: #FAFAFA;
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #F7F7F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.answer-tag {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(46, 200, 79, 0.1);
  color: #2EC84F;
  border: 1px solid #2EC84F;
  border-radius: 12px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
}

.cancel-collect-btn {
  padding: 6px 16px;
  height: 28px;
  background: #F7F7F7;
  color: #666;
  border: none;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}

.cancel-collect-btn:active {
  transform: scale(0.95);
  background: #EFEFEF;
}

.question-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
  margin-bottom: 8px;
  line-height: 1.4;
}

.answer-content {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.answer-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999999;
}

/* 话题列表 */
.topics-list {
  background: #fff;
}

.topic-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #F5F5F5;
  cursor: pointer;
  transition: background 0.2s;
  gap: 12px;
}

.topic-card:active {
  background: #FAFAFA;
}

.topic-icon-wrapper {
  flex-shrink: 0;
}

.topic-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.topic-info {
  flex: 1;
  min-width: 0;
}

.topic-name {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-stats {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999999;
  display: flex;
  align-items: center;
  gap: 8px;
}

.divider {
  width: 1px;
  height: 12px;
  background: #E5E5E5;
}

/* 加载和空状态 */
.loading,
.empty {
  padding: 60px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
