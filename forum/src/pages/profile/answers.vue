<template>
  <div class="answers-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="header-title">被采纳</div>
    </div>

    <!-- 回答列表 -->
    <div class="answers-list">
      <!-- 点击遮罩关闭菜单 -->
      <div v-if="activeMenuId" class="menu-overlay" @click="activeMenuId = null"></div>
      
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="acceptedAnswers.length === 0" class="empty">暂无被采纳的回答</div>
      <div
        v-else
        v-for="answer in acceptedAnswers"
        :key="answer.answer_id"
        class="answer-card"
      >
        <div class="card-header">
          <!-- 回答内容 -->
          <div class="answer-content">{{ answer.content }}</div>

          <!-- 回答图片 -->
          <div class="answer-images" v-if="answer.images && answer.images.length > 0">
            <img
              v-for="(image, index) in answer.images"
              :key="index"
              class="image-item"
              :class="`image-count-${answer.images.length}`"
              :src="image" 
              alt="回答图片"
              @click="handleImageClick(image)"
            />
          </div>

          <!-- 更多操作按钮 -->
          <div class="more-btn-wrapper">
          <div class="more-btn" @click.stop="toggleMenu(answer.answer_id)">
            <el-icon :size="20">
                <MoreFilled />
              </el-icon>
            </div>
          </div>
        </div>

        <!-- 更多菜单 -->
        <div v-if="activeMenuId === answer.answer_id" class="more-menu">
          <div class="menu-item" @click="handleEdit(answer)">修改回答</div>
          <div class="menu-item" @click="handleAddReply(answer)">追加回答</div>
          <div class="menu-item" @click="handleDelete(answer)">删除回答</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, MoreFilled } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { getMyUsefulAnswers, deleteAnswer, type AnswerItem } from '../../api/answer'
import { useImageViewerStore } from '../../stores/imageViewer'

const router = useRouter()
const imageViewerStore = useImageViewerStore()

// 被采纳的回答数据
const acceptedAnswers = ref<AnswerItem[]>([])
const loading = ref(false)
const activeMenuId = ref<number | null>(null)

// 切换菜单
const toggleMenu = (answerId: number) => {
  if (activeMenuId.value === answerId) {
    activeMenuId.value = null
  } else {
    activeMenuId.value = answerId
  }
}

// 加载被采纳的回答
const loadAcceptedAnswers = async () => {
  try {
    loading.value = true
    const res = await getMyUsefulAnswers(1, 20)
    if (res.code === 200) {
      acceptedAnswers.value = res.data.items
    } else {
      //ElMessage.error(res.message || '获取回答失败')
    }
  } catch (error) {
    console.error('获取回答失败:', error)
    //ElMessage.error('获取回答失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadAcceptedAnswers()
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 修改回答
const handleEdit = (answer: AnswerItem) => {
  activeMenuId.value = null
  // 跳转到编辑页面
  router.push(`/post/detail?id=${answer.question_id}`)
}

// 追加回答
const handleAddReply = (answer: AnswerItem) => {
  activeMenuId.value = null
  // 跳转到问题详情页
  router.push(`/post/detail?id=${answer.question_id}`)
}

// 删除回答
const handleDelete = async (answer: AnswerItem) => {
  activeMenuId.value = null
  try {
    await ElMessageBox.confirm('确定要删除这条回答吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deleteAnswer(answer.answer_id)
    if (res.code === 200) {
      //ElMessage.success('删除成功')
      // 重新加载列表
      loadAcceptedAnswers()
    } else {
      //ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      //ElMessage.error('删除失败')
    }
  }
}

// 处理图片点击
const handleImageClick = (imageUrl: string) => {
  imageViewerStore.open(imageUrl)
}
</script>

<style scoped>
.answers-page {
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

/* 回答列表 */
.answers-list {
  padding: 16px;
}

.answer-card {
  padding: 12px 0;
  border-bottom: 1px solid #F5F5F5;
  position: relative;
}

.answer-content {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 15px;
  color: #1A1A1A;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-bottom: 12px;
}

/* 回答图片 */
.answer-images {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.image-item {
  display: block;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
  max-width: 100%;
  object-fit: cover;
}

.image-count-1 {
  width: 108px;
  height: 108px;
  border-radius: 8px;
}

.image-count-2 {
  width: 108px;
  height: 108px;
  border-radius: 8px;
}

.image-count-3 {
  width: 108px;
  height: 108px;
  border-radius: 8px;
}

.more-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 12px;
}
.more-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
}
.more-btn:active {
  color: #666;
}

/* 底部操作栏 */
.answer-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  height: 40px;
  background: #F7F7F7;
  border: none;
  border-radius: 20px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:active {
  transform: scale(0.95);
  background: #EFEFEF;
}

.delete-btn {
  background: #FFF5F5;
  color: #FF3C39;
}

.delete-btn:active {
  background: #FFE5E5;
  transform: scale(0.95);
}

/* 更多菜单 */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}

.more-menu {
  position: absolute;
  top: 32px;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  overflow: hidden;
  z-index: 100;
  min-width: 120px;
  animation: slideDown 0.2s ease;
  backdrop-filter: blur(10px);
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

.menu-item {
  padding: 14px 16px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #FFFFFF;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.delete {
  color: #FF3C39;
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
