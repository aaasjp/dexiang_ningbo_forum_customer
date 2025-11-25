<template>
  <div class="questions-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="header-title">我的提问</div>
    </div>

    <!-- 提问列表 - 使用无限滚动 -->
    <InfiniteScroll
      :loading="loading"
      :no-more="noMore"
      :is-empty="isEmpty"
      :enable-pull-refresh="true"
      empty-text="暂无提问"
      @load-more="loadMore"
      @refresh="refresh"
    >
      <div class="questions-list">
        <div
          v-for="question in questions"
          :key="question.question_id"
          class="question-card"
          @click="goToDetail(question.question_id)"
        >
          <!-- 问题标题 -->
          <div class="question-title">{{ question.title }}</div>
          
          <!-- 问题内容 -->
          <div class="question-content" v-if="question.content">
            {{ question.content }}
          </div>

          <!-- 问题图片 -->
          <div class="question-images" v-if="question.images && question.images.length > 0">
            <img
              v-for="(image, index) in question.images.slice(0, 3)"
              :key="index"
              class="image-item"
              :class="`image-count-${Math.min(question.images.length, 3)}`"
              :src="image" 
              alt="问题图片"
              @click.stop="handleImageClick(image)"
            />
          </div>

          <!-- 问题状态和统计 -->
          <div class="question-footer">
            <div class="question-stats">
              <span class="stat-item">
                <span class="stat-value">{{ question.view_count }}</span>浏览
              </span>
              <span class="stat-item">
                <span class="stat-value">{{ question.answer_count }}</span>回答
              </span>
              <span class="stat-item">{{ formatTime(question.create_time) }}</span>
            </div>
            <div 
              class="question-status"
              :class="{
                'status-solved': question.status === 1,
                'status-unsolved': question.status === 0
              }"
            >
              {{ question.status === 1 ? '已解决' : '待解决' }}
            </div>
          </div>
        </div>
      </div>
    </InfiniteScroll>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import InfiniteScroll from '../../components/common/InfiniteScroll.vue'
import { getMyQuestions, type QuestionItem } from '../../api/question'
import { useImageViewerStore } from '../../stores/imageViewer'
import { useInfiniteScroll } from '../../composables/useInfiniteScroll'

const router = useRouter()
const imageViewerStore = useImageViewerStore()

// 使用无限滚动 Hook
const {
  list: questions,
  loading,
  isEmpty,
  noMore,
  loadMore,
  refresh
} = useInfiniteScroll<QuestionItem>(
  async (page: number, pageSize: number) => {
    return await getMyQuestions(page, pageSize)
  },
  {
    pageSize: 20
  }
)

// 页面加载时获取数据
onMounted(() => {
  refresh()
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到问题详情
const goToDetail = (questionId: number) => {
  router.push(`/post/${questionId}`)
}

// 处理图片点击
const handleImageClick = (imageUrl: string) => {
  imageViewerStore.open(imageUrl)
}

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  
  // 小于24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  
  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }
  
  // 显示日期
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}
</script>

<style scoped>
::v-deep .infinite-scroll-wrapper {
  padding-bottom: 60px;
}

.questions-page {
  width: 100%;
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

/* 提问列表 */
.questions-list {
  padding: 0 16px;
}

.question-card {
  padding: 16px 0;
  border-bottom: 1px solid #F5F5F5;
  cursor: pointer;
}

.question-card:active {
  background: #FAFAFA;
}

.question-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 16px;
  color: #1A1A1A;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-content {
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

/* 问题图片 */
.question-images {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.image-item {
  display: block;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
  object-fit: cover;
}

.image-count-1 {
  width: 108px;
  height: 108px;
}

.image-count-2 {
  width: 108px;
  height: 108px;
}

.image-count-3 {
  width: 108px;
  height: 108px;
}

/* 底部统计和状态 */
.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-stats {
  display: flex;
  gap: 16px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999999;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-value {
  color: #666;
}

.question-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
}

.status-solved {
  background: rgba(46, 200, 79, 0.1);
  color: #2EC84F;
}

.status-unsolved {
  background: rgba(255, 152, 0, 0.1);
  color: #FF9800;
}
</style>
