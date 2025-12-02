<template>
  <div class="profile-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="header-title">个人中心</div>
    </div>

    <!-- 整个页面使用无限滚动支持下拉刷新 -->
    <InfiniteScroll
      :loading="questionsLoading || answersLoading"
      :no-more="displayPosts.length > 0"
      :is-empty="displayPosts.length === 0"
      :enable-pull-refresh="true"
      :empty-text="activeTab === 'questions' ? '暂无提问' : '暂无回答'"
      @refresh="handleRefresh"
    >
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <Avatar :src="userProfile?.forum_avatar" :name="userProfile?.name" :size="56" />
        <div class="user-info">
          <div class="user-name-wrapper">
            <div class="user-name">{{ userProfile?.name || '加载中...' }}</div>
            <div class="user-badge" v-if="userProfile?.forum_tag && userProfile.forum_tag !== '普通用户'">{{ userProfile.forum_tag }}</div>
          </div>
          <div class="user-desc">{{ userProfile?.self_introduction || '这个人很懒，什么都没留下' }}</div>
        </div>
        <div class="edit-btn" @click="goToInfo">编辑资料</div>
      </div>

      <!-- 功能图标区 -->
      <div class="action-icons">
        <div class="action-item" @click="goToMentions">
          <div class="action-icon">
            <img src="../../assets/images/profile/at.png" alt="at" />
          </div>
          <div class="action-label">@我</div>
        </div>
        <div class="action-item" @click="goToFavorites">
          <div class="action-icon">
            <img src="../../assets/images/profile/collect.png" alt="star" />
          </div>
          <div class="action-label">收藏</div>
        </div>
        <div class="action-item" @click="goToQuestions">
          <div class="action-icon">
            <img src="../../assets/images/profile/get.png" alt="pen" />
          </div>
          <div class="action-label">被采纳</div>
        </div>
        <div class="action-item" @click="goToPoints">
          <div class="action-icon">
            <img src="../../assets/images/profile/score.png" alt="award" />
          </div>
          <div class="action-label">积分</div>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="tabs">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'questions' }"
          @click="activeTab = 'questions'"
        >
          提问
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'answers' }"
          @click="activeTab = 'answers'"
        >
          回答
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <PostCard
          v-for="post in displayPosts"
          :key="post.id"
          :post="post"
          @click="handlePostClick(post)"
          @like="handlePostLike"
        />
      </div>
    </InfiniteScroll>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import PostCard from '../../components/post/PostCard.vue'
import Avatar from '../../components/common/Avatar.vue'
import InfiniteScroll from '../../components/common/InfiniteScroll.vue'
import { getUserProfile, type UserProfile } from '../../api/user'
import { getMyQuestions, type QuestionItem, toggleLikeQuestion } from '../../api/question'
import { getMyAnswers, type AnswerItem } from '../../api/answer'
import { transformQuestionToPost } from '../../utils/transform'
import type { Post } from '../../types/post'
import { useScrollKeepAlive } from '../../composables/useScrollKeepAlive'

defineOptions({
  name: 'Profile'
})

useScrollKeepAlive()

const router = useRouter()

// 当前激活的 tab
const activeTab = ref<'questions' | 'answers'>('questions')

// 用户信息
const userProfile = ref<UserProfile | null>(null)
const loading = ref(false)

// 我的提问列表
const myQuestions = ref<QuestionItem[]>([])
const questionsLoading = ref(false)

// 我的回答列表
const myAnswers = ref<AnswerItem[]>([])
const answersLoading = ref(false)

// 加载用户信息
const loadUserProfile = async () => {
  try {
    loading.value = true
    const res = await getUserProfile()
    if (res.code === 200) {
      userProfile.value = res.data
      console.log('✅ 用户信息加载成功:', userProfile.value)
    } else {
      //ElMessage.error(res.message || '获取用户信息失败')
    }
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载我的提问
const loadMyQuestions = async () => {
  try {
    questionsLoading.value = true
    const res = await getMyQuestions(1, 20)
    if (res.code === 200) {
      // 补充当前用户信息到问题列表中，防止出现匿名
      const userName = userProfile.value?.name || '用户'
      const userCode = userProfile.value?.staff_code || ''
      
      console.log('📝 补充用户信息到提问列表:', { userName, userCode })
      
      myQuestions.value = res.data.items.map(item => ({
        ...item,
        asker_name: item.asker_name || userName,
        asker_code: item.asker_code || userCode
      }))
      
      console.log('✅ 提问列表加载完成，共', myQuestions.value.length, '条')
    } else {
      //ElMessage.error(res.message || '获取提问失败')
    }
  } catch (error) {
    console.error('❌ 获取提问失败:', error)
  } finally {
    questionsLoading.value = false
  }
}

// 加载我的回答
const loadMyAnswers = async () => {
  try {
    answersLoading.value = true
    const res = await getMyAnswers(1, 20)
    if (res.code === 200) {
      // 补充当前用户信息到回答列表中，防止出现匿名
      const userName =  userProfile.value?.name || '用户'
      const userCode = userProfile.value?.staff_code || ''
      
      console.log('💬 补充用户信息到回答列表:', { userName, userCode })
      
      myAnswers.value = res.data.items.map(item => ({
        ...item,
        answerer_name: item.answerer_name || userName,
        answerer_code: item.answerer_code || userCode
      }))
      
      console.log('✅ 回答列表加载完成，共', myAnswers.value.length, '条')
    } else {
      //ElMessage.error(res.message || '获取回答失败')
    }
  } catch (error) {
    console.error('❌ 获取回答失败:', error)
  } finally {
    answersLoading.value = false
  }
}

// 页面加载时获取数据
onMounted(async () => {
  // 先加载用户信息，再加载列表数据，确保能正确补充用户信息
  await loadUserProfile()
  // 用户信息加载完成后，再并行加载列表数据
  await Promise.all([
    loadMyQuestions(),
    loadMyAnswers()
  ])
})


onActivated(() => {
  loadUserProfile()
})

// 下拉刷新处理
const handleRefresh = async () => {
  await loadUserProfile()
  await Promise.all([
    loadMyQuestions(),
    loadMyAnswers()
  ])
}

// 根据 tab 显示不同的帖子
const displayPosts = computed(() => {
  if (activeTab.value === 'questions') {
    // 转换问题为Post格式
    return myQuestions.value.map(q => transformQuestionToPost(q))
  } else {
    // 转换回答为Post格式
    return myAnswers.value.map(a => ({
      id: String(a.question_id),
      author: {
        name: a.answerer_name,
        avatar: '👤'
      },
      category: 'answer',
      title: a.question_id ? `回答了问题： ${a.question_title}` : '回答',
      content: a.content,
      time: a.create_time,
      solved: a.is_useful === 1,
      likes: a.like_count,
      collects: a.favorite_count,
      comments: 0
    } as Post))
  }
})

// 跳转函数
const goToInfo = () => router.push('/profile/info')
const goToMentions = () => router.push('/profile/mentions')
const goToFavorites = () => router.push('/profile/favorites')
const goToPoints = () => router.push('/profile/points')
const goToQuestions = () => router.push('/profile/answers')

// 处理帖子点击
const handlePostClick = (post: Post) => {
  router.push(`/post/${post.id}`)
}

// 处理帖子点赞
const handlePostLike = async (post: Post) => {
  try {
    const questionId = post.question_id || Number(post.id)
    const response = await toggleLikeQuestion(questionId)
    
    // 更新帖子的点赞状态
    if (activeTab.value === 'questions' && response.data) {
      const postIndex = myQuestions.value.findIndex(q => q.question_id === questionId)
      if (postIndex !== -1 && myQuestions.value[postIndex]) {
        myQuestions.value[postIndex].is_liked = response.data.liked
        myQuestions.value[postIndex].like_count = response.data.liked 
          ? (myQuestions.value[postIndex].like_count || 0) + 1 
          : (myQuestions.value[postIndex].like_count || 0) - 1
      }
    }
    
    //ElMessage.success(response.data.liked ? '点赞成功' : '取消点赞')
  } catch (error) {
    console.error('点赞失败:', error)
    //ElMessage.error('操作失败')
  }
}
</script>

<style scoped>
.profile-page {
  width: 100%;
  background: #FFFFFF;
  overflow-x: hidden;
}

/* 顶部导航 */
.header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  z-index: 1000;
}

.header-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #1A1A1A;
  text-align: center;
}

/* 无限滚动调整 */
::v-deep .infinite-scroll-wrapper {
  margin-top: 43px; /* header height (padding + content) */
}

/* 用户信息卡片 */
.user-card {
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.user-name {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 16px;
  color: #1A1A1A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-badge {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 400;
  height: 20px;
  color: #A56D39;
  background: linear-gradient(133deg, #FDF3EA 0%, #F5E9DE 100%);
  border: 1px solid #DEB691;
  border-radius: 10px 0 10px 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.user-desc {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999999;
}

.edit-btn {
  padding: 0 16px;
  height: 28px;
  line-height: 28px;
  background: #fff;
  color: #666;
  border: 1px solid #E5E5E5;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}

/* .edit-btn:active {
  transform: scale(0.95);
} */

/* 功能图标区 */
.action-icons {
  background: #fff;
  padding: 16px;
  display: flex;
  justify-content: space-around;
  margin-bottom: 8px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-item:active {
  transform: scale(0.95);
}

.action-icon {
  width: 40px;
  height: 40px;
}

.action-icon img {
  display: block;
  width: 100%;
  height: 100%;
}
.action-label {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #666;
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
  background: #fff;
}
</style>
