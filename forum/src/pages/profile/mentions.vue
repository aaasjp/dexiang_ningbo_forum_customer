<template>
  <div class="mentions-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="header-title">邀请我的</div>
    </div>

    <!-- 邀请列表 -->
    <div class="mentions-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="invitedQuestions.length === 0" class="empty">暂无邀请</div>
      <div
        v-else
        v-for="question in invitedQuestions"
        :key="question.question_id"
        class="mention-card"
        @click="handleMentionClick(question)"
      >
        <!-- 用户信息 -->
        <div class="mention-header">
          <div class="user-avatar">👤</div>
          <div class="user-info">
            <div class="user-name">{{ question.asker_name }}</div>
            <div class="mention-action">邀请你回答 · {{ formatTime(question.create_time) }}</div>
          </div>
        </div>

        <!-- 问题内容 -->
        <div class="question-content">
          {{ question.title }}
        </div>

        <!-- 统计信息 -->
        <div class="question-stats">
          <span class="stat-item">{{ question.view_count }}浏览量</span>
          <span class="stat-item">{{ question.answer_count }}回答</span>
        </div>

        <!-- 写回答按钮 -->
        <button class="answer-btn" @click="handleAnswer(question, $event)">写回答</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMyInvitedQuestions, type QuestionItem } from '../../api/question'

const router = useRouter()

// 邀请我的问题列表
const invitedQuestions = ref<QuestionItem[]>([])
const loading = ref(false)

// 加载邀请我的问题
const loadInvitedQuestions = async () => {
  try {
    loading.value = true
    const res = await getMyInvitedQuestions(1, 20)
    if (res.code === 200) {
      invitedQuestions.value = res.data.items
    } else {
      ElMessage.error(res.message || '获取邀请失败')
    }
  } catch (error) {
    console.error('获取邀请失败:', error)
    ElMessage.error('获取邀请失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadInvitedQuestions()
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

// 处理点击
const handleMentionClick = (question: QuestionItem) => {
  router.push(`/post/detail?id=${question.question_id}`)
}

// 写回答
const handleAnswer = (question: QuestionItem, event: Event) => {
  event.stopPropagation()
  router.push(`/post/detail?id=${question.question_id}`)
}
</script>

<style scoped>
.mentions-page {
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

/* 邀请列表 */
.mentions-list {
  padding: 12px 16px;
}

.mention-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.mention-card:active {
  transform: scale(0.98);
  background: #FAFAFA;
}

/* 用户信息 */
.mention-header {
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

.mention-action {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999999;
}

/* 问题内容 */
.question-content {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
  line-height: 1.5;
  margin-bottom: 12px;
}

/* 统计信息 */
.question-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999999;
}

/* 写回答按钮 */
.answer-btn {
  width: 100%;
  height: 46px;
  background: #FFDD00;
  border: none;
  border-radius: 23px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
  cursor: pointer;
  transition: all 0.2s;
}

.answer-btn:active {
  transform: scale(0.95);
  background: #FFD700;
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
