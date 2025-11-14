<template>
  <div class="topic-detail-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="search-bar">
        <el-icon class="search-icon" :size="18">
          <Search />
        </el-icon>
        <input 
          type="text" 
          :placeholder="topicData.title"
          v-model="searchKeyword"
        />
      </div>
    </div>

    <!-- 话题信息卡片 -->
    <div class="topic-header">
      <div class="topic-title-section">
        <div class="topic-name"># {{ topicData.title }}</div>
        <div class="topic-stats">
          {{ formatCount(topicData.question_count) }}篇内容
        </div>
      </div>
      <button 
        class="collect-btn" 
        :class="{ collected: isCollected }"
        @click="toggleCollect"
      >
        {{ isCollected ? '已收藏' : '收藏' }}
      </button>
    </div>

    <!-- 帖子列表 -->
    <div class="posts-section">
      <PostCard
        v-for="post in filteredPosts"
        :key="post.id"
        :post="post"
        @click="handlePostClick(post)"
        @like="handlePostLike"
      />
      
      <!-- 空状态 -->
      <div v-if="filteredPosts.length === 0" class="empty-state">
        <div class="empty-icon">
          <img src="../../assets/images/empty/follow_empty.png" alt="暂无内容" width="130" height="130" />
        </div>
        <div class="empty-text">暂无内容</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import PostCard from '../../components/post/PostCard.vue'
import { getTopicDetail, getTopicQuestions, toggleFavoriteTopic } from '../../api/topic'
import { toggleLikeQuestion } from '../../api/question'
import { transformQuestionToPost } from '../../utils/transform'
import type { Topic } from '../../api/topic'
import type { Post } from '../../types/post'

const router = useRouter()
const route = useRoute()

// 搜索关键词
const searchKeyword = ref('')

// 加载状态
const loading = ref(false)

// 获取话题 ID
const topicId = Number(route.params.id)

// 获取话题数据
const topicData = ref<Topic>({
  topic_id: topicId,
  title: '加载中...',
  description: '',
  question_count: 0,
  create_time: ''
})

// 是否已收藏
const isCollected = ref(false)

// 话题下的帖子列表
const topicPosts = ref<Post[]>([])

// 根据搜索关键词过滤
const filteredPosts = computed(() => {
  if (!searchKeyword.value.trim()) {
    return topicPosts.value
  }
  return topicPosts.value.filter(post =>
    post.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 加载话题详情
const loadTopicDetail = async () => {
  try {
    const response = await getTopicDetail(topicId)
    topicData.value = response.data
  } catch (error) {
    console.error('加载话题详情失败:', error)
    //ElMessage.error('加载话题详情失败')
  }
}

// 加载话题下的问题列表
const loadTopicQuestions = async () => {
  try {
    loading.value = true
    const response = await getTopicQuestions(topicId, 1, 100)
    topicPosts.value = response.data.items.map(transformQuestionToPost)
  } catch (error) {
    console.error('加载问题列表失败:', error)
    //ElMessage.error('加载问题列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化数字
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1).replace('.0', '') + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1).replace('.0', '') + 'k'
  }
  return count.toString()
}

// 切换收藏状态
const toggleCollect = async () => {
  try {
    const response = await toggleFavoriteTopic(topicId)
    isCollected.value = response.data.favorited
    
    if (isCollected.value) {
      //ElMessage.success('收藏成功')
    } else {
      //ElMessage.info('取消收藏')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    //ElMessage.error('操作失败')
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 处理帖子点击
const handlePostClick = (post: Post) => {
  router.push(`/post/${post.question_id || post.id}`)
}

// 处理帖子点赞
const handlePostLike = async (post: Post) => {
  try {
    const questionId = post.question_id || Number(post.id)
    const response = await toggleLikeQuestion(questionId)
    
    // 更新帖子的点赞状态
    const postIndex = topicPosts.value.findIndex(p => p.id === post.id)
    if (postIndex !== -1 && response.data && topicPosts.value[postIndex]) {
      topicPosts.value[postIndex].liked = response.data.liked
      if (response.data.liked) {
        topicPosts.value[postIndex].likes++
      } else {
        topicPosts.value[postIndex].likes--
      }
    }
    
    //ElMessage.success(response.data.liked ? '点赞成功' : '取消点赞')
  } catch (error) {
    console.error('点赞失败:', error)
    //ElMessage.error('操作失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadTopicDetail()
  loadTopicQuestions()
})
</script>

<style scoped>
.topic-detail-page {
  width: 100%;
  max-width: 100vw;
  background: #FFFFFF;
  overflow-x: hidden;
}

/* 顶部导航 */
.header {
  background: #fff;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333;
  flex-shrink: 0;
}

/* 搜索栏 */
.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.search-icon {
  color: #999;
  position: absolute;
  left: 12px;
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
}

.search-bar input::placeholder {
  color: #999;
}

/* 话题信息卡片 */
.topic-header {
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.topic-title-section {
  flex: 1;
  min-width: 0;
}

.topic-name {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 20px;
  color: #1A1A1A;
  margin-bottom: 8px;
  line-height: 1.4;
  word-wrap: break-word;
  word-break: break-word;
}

.topic-stats {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #999999;
  display: flex;
  align-items: center;
  gap: 8px;
}

.divider {
  width: 20px;
  height: 12px;
  /* background: #E5E5E5; */
}

/* 收藏按钮 */
.collect-btn {
  min-width: 80px;
  height: 36px;
  padding: 0 16px;
  background: #FFDD00;
  border: none;
  border-radius: 18px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #1A1A1A;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}

.collect-btn:active {
  transform: scale(0.95);
}

.collect-btn.collected {
  background: #E5E5E5;
  color: #999999;
}

/* 帖子列表区域 */
.posts-section {
  background: #fff;
}

/* 空状态 */
.empty-state {
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
  font-size: 14px;
  color: #999;
  text-align: center;
  line-height: 1.6;
}
</style>

