<template>
  <div class="topic-content-management">
    <!-- 页面标题 -->
    <h2 class="page-title">话题管理/管理话题内容</h2>
    <!-- 白色背景区块 -->
    <div class="content-wrapper">
      <!-- 页面标题 -->
      <div class="page-header" @click="handleBack">
        <el-icon class="back-icon"><ArrowLeft /></el-icon>
        <span class="page-title-inner">话题管理</span>
      </div>

      <!-- 表格 -->
      <div class="table-section">
        <el-table :data="questionList" style="width: 100%" class="content-table" v-loading="loading">
          <el-table-column prop="sequence" label="序号" width="80" align="center" />
          <el-table-column label="问题" min-width="300">
            <template #default="{ row }">
              <div class="title-content">
                <span class="title-text">{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="author" label="作者" width="150" />
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button link type="warning" @click="handleEdit(row)">编辑</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, prev, pager, next, sizes"
          class="custom-pagination"
        />
      </div>
    </div>

    <!-- 编辑弹框 -->
    <TopicChangeDialog
      v-model="showEditDialog"
      :data="currentEditData"
      :current-topic-id="topicId"
      @confirm="handleEditConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getTopicQuestions } from '@/api/topics'
import { getQuestionDetail } from '@/api/content'
import TopicChangeDialog from '../components/TopicChangeDialog.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const topicId = ref(null)
const questionList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const showEditDialog = ref(false)
const currentEditData = ref(null)

// 返回话题管理
const handleBack = () => {
  router.push('/topics')
}

// 获取话题下的问题列表
const fetchQuestionList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    
    const res = await getTopicQuestions(topicId.value, params)
    
    if (res.data && res.data.items) {
      questionList.value = res.data.items.map((item, index) => ({
        id: item.question_id,
        sequence: (currentPage.value - 1) * pageSize.value + index + 1,
        title: item.title,
        author: item.asker_name,
        questionData: item // 保存原始数据
      }))
      
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取问题列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听分页变化
watch([currentPage, pageSize], () => {
  fetchQuestionList()
})

// 处理编辑
const handleEdit = async (row) => {
  try {
    // 获取完整的问题详情（包括话题信息）
    const res = await getQuestionDetail(row.id)
    if (res.data) {
      currentEditData.value = res.data
      showEditDialog.value = true
    }
  } catch (error) {
    console.error('获取问题详情失败:', error)
  }
}

// 处理编辑确认
const handleEditConfirm = () => {
  // 弹框内部已经处理了 API 调用，这里只需要刷新列表
  showEditDialog.value = false
  currentEditData.value = null
  fetchQuestionList()
}

// 组件挂载时获取数据
onMounted(() => {
  topicId.value = parseInt(route.params.id)
  if (topicId.value) {
    fetchQuestionList()
  } else {
    ElMessage.error('话题ID不存在')
    router.push('/topics')
  }
})
</script>

<style scoped>
.topic-content-management {
  width: 100%;
}
.page-title {
  font-weight: 400;
  font-size: 12px;
  color: #999999;
  margin-bottom: 16px;
}

.content-wrapper {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  cursor: pointer;
  width: fit-content;
}

.page-header:hover .page-title-inner {
  color: #FF7800;
}

.back-icon {
  font-size: 20px;
  color: #333333;
  transition: color 0.3s;
}

.page-header:hover .back-icon {
  color: #FF7800;
}

.page-title-inner {
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  transition: color 0.3s;
}

.table-section {
  flex: 1;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 表格样式 */
.content-table :deep(.el-table__header-wrapper) {
  background: #f5f5f5;
}

.content-table :deep(.el-table__header th) {
  background: #f5f5f5 !important;
}

.content-table :deep(.el-table__row) {
  background: #ffffff;
}

.content-table :deep(.el-table__row--striped) {
  background: #ffffff;
}

/* 标题内容样式 */
.title-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>

