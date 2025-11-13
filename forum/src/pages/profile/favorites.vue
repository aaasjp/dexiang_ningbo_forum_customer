<template>
  <div class="favorites-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </div>
      <!-- Tab 切换放到标题位置 -->
      <div class="header-tabs">
        <div
          class="header-tab"
          :class="{ active: activeTab === 'answers' }"
          @click="activeTab = 'answers'"
        >
          回答
        </div>
        <div
          class="header-tab"
          :class="{ active: activeTab === 'topics' }"
          @click="activeTab = 'topics'"
        >
          话题
        </div>
      </div>
      <div class="placeholder"></div>
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
            <Avatar :src="item.answerer_avatar" :name="item.type === 'answer' ? item.answerer_name : '匿名用户'" :size="24" />
            <div class="user-info">
              <div class="user-name">{{ item.type === 'answer' ? item.answerer_name : '匿名用户' }}</div>
            </div>
            <div class="answer-tag" v-if="item.category">{{ item.category }}</div>
          </div>

          <!-- 问题标题 -->
          <div class="question-title">{{ item.type === 'question' ? item.title : item.question_title }}</div>

          <!-- 回答内容 -->
          <div class="answer-content" v-if="item.content">{{ item.content }}</div>

          <!-- 底部统计信息和更多按钮 -->
          <div class="answer-footer">
            <div class="answer-stats">
              <span class="stat-item">{{ formatCount(item.like_count) }}赞</span>
              <span class="stat-divider">·</span>
              <span class="stat-item">{{ formatCount(item.view_count) }}浏览量</span>
            </div>
            <div class="more-btn" @click.stop="toggleMoreMenu(item.id)">
              <el-icon :size="16">
                <MoreFilled />
              </el-icon>
              <!-- 更多菜单 -->
              <div v-if="showMoreMenuId === item.id" class="more-menu">
                <div class="more-menu-item" @click.stop="handleCancelCollect(item)">
                  取消收藏
                </div>
              </div>
            </div>
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
          <!-- 话题信息 -->
          <div class="topic-info">
            <div class="topic-name-wrapper">
              <div class="topic-icon">
                #
              </div>
              <div class="topic-name">{{ topic.title }}</div>
            </div>
            <div class="topic-footer">
              <div class="topic-stats">
                <span class="topic-stats-item">{{ formatCount(topic.question_count) }}篇内容</span>
                <span class="topic-stats-divider">·</span>
                <span class="topic-stats-item">{{ formatCount(topic.view_count ? topic.view_count : 0) }}次浏览</span>
              </div>
              <div class="more-btn" @click.stop="toggleMoreMenu(topic.topic_id)">
                <el-icon :size="16">
                  <MoreFilled />
                </el-icon>
                <!-- 更多菜单 -->
                <div v-if="showMoreMenuId === topic.topic_id" class="more-menu">
                  <div class="more-menu-item" @click.stop="handleCancelTopicCollect(topic)">
                    取消收藏
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMyFavorites, type FavoriteItem } from '../../api/question'
import { getMyFavoriteTopics, type Topic } from '../../api/topic'
import Avatar from '../../components/common/Avatar.vue'

const router = useRouter()
const activeTab = ref<'answers' | 'topics'>('answers')

// 收藏的回答数据
const favoriteAnswers = ref<FavoriteItem[]>([])
const answersLoading = ref(false)

// 收藏的话题数据
const favoriteTopics = ref<Topic[]>([])
const topicsLoading = ref(false)

// 更多菜单状态
const showMoreMenuId = ref<number | string | null>(null)

// 加载收藏的回答和问题
const loadFavoriteAnswers = async () => {
  try {
    answersLoading.value = true
    const res = await getMyFavorites(1, 20)
    if (res.code === 200) {
      favoriteAnswers.value = res.data.items
    } else {
      //ElMessage.error(res.message || '获取收藏失败')
    }
  } catch (error) {
    console.error('获取收藏失败:', error)
    //ElMessage.error('获取收藏失败')
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
      //ElMessage.error(res.message || '获取话题失败')
    }
  } catch (error) {
    console.error('获取话题失败:', error)
    //ElMessage.error('获取话题失败')
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
    //ElMessage.success('已取消收藏')
    // 重新加载列表
    loadFavoriteAnswers()
  } catch (error) {
    console.error('取消收藏失败:', error)
    //ElMessage.error('取消收藏失败')
  }
}

// 取消收藏话题
const handleCancelTopicCollect = async (topic: Topic) => {
  try {
    const { toggleFavoriteTopic } = await import('../../api/topic')
    await toggleFavoriteTopic(topic.topic_id)
    //ElMessage.success('已取消收藏')
    // 重新加载列表
    loadFavoriteTopics()
  } catch (error) {
    console.error('取消收藏失败:', error)
    //ElMessage.error('取消收藏失败')
  }
}

// 切换更多菜单
const toggleMoreMenu = (id: number | string) => {
  if (showMoreMenuId.value === id) {
    showMoreMenuId.value = null
  } else {
    showMoreMenuId.value = id
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
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.placeholder {
  width: 20px;
  flex-shrink: 0;
}

/* Tab 切换在标题位置 */
.header-tabs {
  display: flex;
  gap: 20px;
  flex: 1;
  justify-content: center;
}

.header-tab {
  font-size: 18px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  padding-bottom: 4px;
  font-size: 17px;
  transition: all 0.3s;
}

.header-tab.active {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 17px;
  color: #1A1A1A;
}

.header-tab.active::after {
  content: '';
  position: absolute;
  bottom: 5px;
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
  background: #fff;
}

.answer-card:active {
  background: #FAFAFA;
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.answer-tag {
  width: 40px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 12px 0 12px 0;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
  border: 1px solid;
  background: rgba(46, 200, 79, 0.1);
  color: #2EC84F;
  border-color: #2EC84F;
}

.question-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
  line-height: 24px;
  margin-bottom: 8px;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  max-height: 48px;
}

.answer-content {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-word;
}

.answer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.answer-stats {
  display: flex;
  gap: 8px;
  align-items: center;
}

.stat-item {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999;
}

.stat-divider {
  font-size: 12px;
  color: #999;
}

.more-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  padding: 4px;
  transition: all 0.2s;
}

.more-btn:hover {
  color: #666;
}

.more-menu {
  position: absolute;
  top: 28px;
  right: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 10;
  min-width: 120px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.more-menu-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.more-menu-item:hover {
  background: #f5f5f5;
}

.more-menu-item:active {
  background: #e8e8e8;
}

/* 话题列表 */
.topics-list {
  background: #fff;
}

.topic-card {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
  background: #FFFFFF;
  box-shadow: 0px 1px 0px 0px #F0F0F0;
  border-radius: 0px 0px 0px 0px;
}

.topic-card:active {
  background: #FAFAFA;
}

.topic-info {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.topic-name-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.topic-icon {
  width: 16px;
  height: 16px;
  background: #FFDD00;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1A1A1A;
  flex-shrink: 0;
}

.topic-name {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  line-height: 22px;
}

.topic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.topic-stats-item {
  font-size: 12px;
  color: #999;
}

.topic-stats-divider {
  font-size: 12px;
  color: #999;
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
