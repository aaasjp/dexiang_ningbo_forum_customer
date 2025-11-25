<template>
  <div class="user-profile-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="header-title">个人中心</div>
      <div class="header-right">
        <!-- <span class="followed-text" v-if="userInfo.is_followed">已关注</span> -->
      </div>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <Avatar :src="userInfo.forum_avatar" :name="userInfo.name" :size="56" />
      <div class="user-info">
        <div class="user-name-row">
          <span class="user-name">{{ userInfo.nickname || userInfo.name }}</span>
          <span v-if="userInfo.forum_tag === '专家'" class="user-badge">{{ userInfo.forum_tag }}</span>
        </div>
        <div class="user-desc">{{ userInfo.self_introduction || '这个人很懒，什么都没留下' }}</div>
      </div>
      <button 
        class="follow-btn" 
        :class="{ followed: userInfo.is_followed }"
        @click="toggleFollow"
      >
        {{ userInfo.is_followed ? '已关注' : '关注' }}
      </button>
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
      <div v-if="questionsLoading || answersLoading" class="loading">加载中...</div>
      <div v-else-if="displayPosts.length === 0" class="empty">
        {{ activeTab === 'questions' ? '暂无提问' : '暂无回答' }}
      </div>
      <PostCard
        v-else
        v-for="post in displayPosts"
        :key="post.id"
        :post="post"
        @click="handlePostClick(post)"
        @like="handlePostLike"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import PostCard from '../../components/post/PostCard.vue'
import Avatar from '../../components/common/Avatar.vue'
import { getUserQuestions, type QuestionItem, toggleLikeQuestion } from '../../api/question'
import { getUserAnswers, type AnswerItem } from '../../api/answer'
import { toggleFollowUser, getOtherUserProfile, type UserProfile } from '../../api/user'
import { transformQuestionToPost } from '../../utils/transform'
import type { Post } from '../../types/post'

const router = useRouter()
const route = useRoute()

// 当前激活的 tab
const activeTab = ref<'questions' | 'answers'>('questions')

// 用户工号（从路由参数获取）
const userCode = ref(route.query.code as string || '')

// 用户信息
const userInfo = ref<UserProfile>({
  staff_code: userCode.value,
  name: '加载中...',
  nickname: '',
  forum_avatar: '',
  forum_tag: '',
  self_introduction: '',
  question_count: 0,
  answer_count: 0,
  total_points: 0,
  is_followed: false
})

// 用户的提问列表
const userQuestions = ref<QuestionItem[]>([])
const questionsLoading = ref(false)

// 用户的回答列表
const userAnswers = ref<AnswerItem[]>([])
const answersLoading = ref(false)

// 加载用户信息
const loadUserInfo = async () => {
  if (!userCode.value) return
  
  try {
    // 使用查看他人主页接口获取用户信息
    const res = await getOtherUserProfile(userCode.value)
    if (res.code === 200 && res.data) {
      userInfo.value = {
        staff_code: res.data.staff_code,
        name: res.data.name,
        nickname: res.data.nickname,
        forum_avatar: res.data.forum_avatar,
        forum_tag: res.data.forum_tag,
        self_introduction: res.data.self_introduction || '这个人很懒，什么都没留下',
        question_count: res.data.question_count,
        answer_count: res.data.answer_count,
        total_points: res.data.total_points,
        is_followed: res.data.is_followed || false
      }
    } else {
      //ElMessage.error(res.message || '用户不存在')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    //ElMessage.error('获取用户信息失败')
  }
}

// 加载用户的提问
const loadUserQuestions = async () => {
  if (!userCode.value) return
  
  try {
    questionsLoading.value = true
    const res = await getUserQuestions(userCode.value, 1, 20)
    if (res.code === 200) {
      userQuestions.value = res.data.items
      // 从第一个问题获取用户信息
      if (res.data.items.length > 0) {
        const firstQuestion = res.data.items[0]
        if (firstQuestion) {
          userInfo.value.name = firstQuestion.asker_name
        }
      }
    } else {
      //ElMessage.error(res.message || '获取提问失败')
    }
  } catch (error) {
    console.error('获取提问失败:', error)
  } finally {
    questionsLoading.value = false
  }
}

// 加载用户的回答
const loadUserAnswers = async () => {
  if (!userCode.value) return
  
  try {
    answersLoading.value = true
    const res = await getUserAnswers(userCode.value, 1, 20)
    if (res.code === 200) {
      userAnswers.value = res.data.items
      // 从第一个回答获取用户信息
      if (res.data.items.length > 0 && !userInfo.value.name) {
        const firstAnswer = res.data.items[0]
        if (firstAnswer) {
          userInfo.value.name = firstAnswer.answerer_name
        }
      }
    } else {
      //ElMessage.error(res.message || '获取回答失败')
    }
  } catch (error) {
    console.error('获取回答失败:', error)
  } finally {
    answersLoading.value = false
  }
}

// 加载所有数据
const loadAllData = async () => {
  if (!userCode.value) {
    //ElMessage.error('用户信息不存在')
    return
  }
  
  // 先获取用户信息
  await loadUserInfo()
  
  // 然后并行加载提问和回答列表
  await Promise.all([
    loadUserQuestions(),
    loadUserAnswers()
  ])
}

// 页面加载时获取数据
onMounted(() => {
  loadAllData()
})

// 监听路由变化
watch(() => route.query.code, (newCode) => {
  if (newCode) {
    userCode.value = newCode as string
    loadAllData()
  }
})

// 根据 tab 显示不同的帖子
const displayPosts = computed(() => {
  if (activeTab.value === 'questions') {
    return userQuestions.value.map(q => transformQuestionToPost(q))
  } else {
    return userAnswers.value.map(a => ({
      id: String(a.answer_id),
      author: {
        name: a.answerer_name,
        avatar: '👤',
        staff_code: a.answerer_code
      },
      category: 'answer',
      title: a.question_id ? `回答了问题： ${a.question_title}` : '回答',
      content: a.content,
      time: a.create_time,
      solved: a.is_useful === 1,
      likes: a.like_count,
      liked: a.is_liked,
      collects: a.favorite_count,
      collected: a.is_favorited,
      comments: 0
    } as Post))
  }
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 切换关注状态
const toggleFollow = async () => {
  if (!userCode.value) return
  
  try {
    const res = await toggleFollowUser(userCode.value)
    if (res.code === 200) {
      userInfo.value.is_followed = res.data.followed
      //ElMessage.success(res.data.followed ? '关注成功' : '取消关注')
    } else {
      //ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    //ElMessage.error('操作失败')
  }
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
    if (activeTab.value === 'questions' && response.data) {
      const postIndex = userQuestions.value.findIndex(q => q.question_id === questionId)
      if (postIndex !== -1 && userQuestions.value[postIndex]) {
        userQuestions.value[postIndex].is_liked = response.data.liked
        userQuestions.value[postIndex].like_count = response.data.liked 
          ? (userQuestions.value[postIndex].like_count || 0) + 1 
          : (userQuestions.value[postIndex].like_count || 0) - 1
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
.user-profile-page {
  width: 100%;
  max-width: 100vw;
  background: #fff;
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
  width: 100%;
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
}

.header-right {
  width: 60px;
  display: flex;
  justify-content: flex-end;
}

.followed-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #B3B3B3;
}

/* 用户信息卡片 */
.user-card {
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name-row {
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
  max-width: 180px;
}

.user-badge {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 400;
  white-space: nowrap;
  flex-shrink: 0;
  height: 20px;
  color: #A56D39;
  text-align: left;
  font-style: normal;
  text-transform: none;
  font-family: PingFang SC, PingFang SC;
  
  /* 背景渐变 */
  background: linear-gradient(133deg, #FDF3EA 0%, #F5E9DE 100%);
  
  /* 左上和右下圆角 */
  position: relative;
  border: 1px solid #DEB691;
  border-radius: 10px 0 10px 0;
  background-clip: padding-box;
  display: flex;
  align-items: center;
}

.user-desc {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999999;
}

.follow-btn {
  width: 64px;
  height: 30px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  background: #FFD700;
  color: #1A1A1A;
  border: none;
  flex-shrink: 0;
}

.follow-btn:active {
  transform: scale(0.95);
}

.follow-btn.followed {
  width: 64px;
  height: 30px;
  background: #F7F7F7;
  border-radius: 18px;
  color: #B3B3B3;
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

/* 加载和空状态 */
.loading,
.empty {
  padding: 60px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
