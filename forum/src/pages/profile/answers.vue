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
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="acceptedAnswers.length === 0" class="empty">暂无被采纳的回答</div>
      <div
        v-else
        v-for="answer in acceptedAnswers"
        :key="answer.answer_id"
        class="answer-card"
      >
        <!-- 回答内容 -->
        <div class="answer-content">{{ answer.content }}</div>

        <!-- 更多操作按钮 -->
        <div class="more-btn" @click="showMenu(answer)">
          <el-icon :size="20">
            <MoreFilled />
          </el-icon>
        </div>

        <!-- 底部操作栏 -->
        <div class="answer-actions">
          <button class="action-btn" @click="handleEdit(answer)">修改回答</button>
          <button class="action-btn" @click="handleAddReply(answer)">追加回答</button>
          <button class="action-btn delete-btn" @click="handleDelete(answer)">删除回答</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyUsefulAnswers, deleteAnswer, type AnswerItem } from '../../api/answer'

const router = useRouter()

// 被采纳的回答数据
const acceptedAnswers = ref<AnswerItem[]>([])
const loading = ref(false)

// 加载被采纳的回答
const loadAcceptedAnswers = async () => {
  try {
    loading.value = true
    const res = await getMyUsefulAnswers(1, 20)
    if (res.code === 200) {
      acceptedAnswers.value = res.data.items
    } else {
      ElMessage.error(res.message || '获取回答失败')
    }
  } catch (error) {
    console.error('获取回答失败:', error)
    ElMessage.error('获取回答失败')
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

// 显示更多菜单
const showMenu = (answer: AnswerItem) => {
  console.log('显示菜单:', answer)
}

// 修改回答
const handleEdit = (answer: AnswerItem) => {
  // 跳转到编辑页面
  router.push(`/post/detail?id=${answer.question_id}`)
}

// 追加回答
const handleAddReply = (answer: AnswerItem) => {
  // 跳转到问题详情页
  router.push(`/post/detail?id=${answer.question_id}`)
}

// 删除回答
const handleDelete = async (answer: AnswerItem) => {
  try {
    await ElMessageBox.confirm('确定要删除这条回答吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deleteAnswer(answer.answer_id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      // 重新加载列表
      loadAcceptedAnswers()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.answers-page {
  width: 100%;
  
  min-height: 100vh;
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
  padding: 0;
}

.answer-card {
  padding: 16px;
  border-bottom: 1px solid #F5F5F5;
  position: relative;
}

.answer-content {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
  line-height: 1.6;
  margin-bottom: 12px;
  padding-right: 32px;
}

.more-btn {
  position: absolute;
  top: 16px;
  right: 16px;
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

/* 加载和空状态 */
.loading,
.empty {
  padding: 60px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
