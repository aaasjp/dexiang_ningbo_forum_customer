<template>
  <div class="topics-management">
    <!-- 页面标题 -->
    <h2 class="page-title">话题管理</h2>

    <!-- 白色背景区块 -->
    <div class="content-wrapper">
      <!-- 标题和操作按钮 -->
      <div class="header-section">
        <h3 class="section-title">话题列表</h3>
        <div class="create-topic-btn" @click="handleCreateTopic">创建新话题</div>
      </div>

      <!-- 话题卡片列表 -->
      <div class="topics-grid">
      <div
        v-for="topic in topicsList"
        :key="topic.id"
        class="topic-card"
      >
        <div class="topic-header">
          <div class="topic-info">
            <h3 class="topic-title">
              <span class="topic-icon">#</span>
              {{ topic.title }}
            </h3>
            <p class="topic-description">{{ topic.description }}</p>
          </div>
        </div>
        <div class="topic-footer">
          <div class="topic-stats">
            <span class="stats-text">关联内容数：{{ topic.relatedPosts }}</span>
          </div>
          <el-dropdown popper-class="dark-dropdown" @command="(cmd) => {
            if (cmd === 'edit') handleEditTopic(topic)
            else if (cmd === 'manage') handleManageContent(topic)
            else if (cmd === 'delete') handleDeleteTopic(topic)
          }">
            <el-icon class="more-icon"><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑话题</el-dropdown-item>
                <el-dropdown-item command="manage">管理内容</el-dropdown-item>
                <el-dropdown-item command="delete" style="color: #808080;">删除话题</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
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

    <!-- 话题表单弹窗 -->
    <TopicFormDialog
      v-model="showTopicDialog"
      :title="dialogTitle"
      :data="currentEditTopic"
      @confirm="handleTopicFormConfirm"
    />

    <!-- 删除确认弹窗 -->
    <DeleteConfirmDialog
      v-model="showDeleteDialog"
      title="删除话题"
      message="确定删除该话题吗？删除后该话题下的所有内容将不再关联此话题。"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { MoreFilled } from '@element-plus/icons-vue'
import { getTopicsList, createTopic, updateTopic, deleteTopic } from '@/api/topics'
import TopicFormDialog from '../components/TopicFormDialog.vue'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const topicsList = ref([])
const loading = ref(false)

// 弹窗相关
const showTopicDialog = ref(false)
const showDeleteDialog = ref(false)
const isEdit = ref(false)
const currentEditTopic = ref(null)
const dialogTitle = ref('创建新话题')

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return String(num)
}

// 获取话题列表
const fetchTopicsList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    
    const res = await getTopicsList(params)
    
    if (res.data && res.data.items) {
      topicsList.value = res.data.items.map(item => ({
        id: item.topic_id,
        icon: '📋', // 默认图标
        title: item.title,
        description: item.description || '暂无描述',
        relatedPosts: formatNumber(item.question_count || 0),
        coverImage: item.cover_image,
        originalData: item
      }))
      
      total.value = res.data.total || res.data.items.length
    }
  } catch (error) {
    console.error('获取话题列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听分页变化
watch([currentPage, pageSize], () => {
  fetchTopicsList()
})

// 处理创建新话题
const handleCreateTopic = () => {
  isEdit.value = false
  dialogTitle.value = '创建新话题'
  currentEditTopic.value = {
    coverImage: '',
    topicName: '',
    description: ''
  }
  showTopicDialog.value = true
}

// 处理编辑话题
const handleEditTopic = (topic) => {
  isEdit.value = true
  dialogTitle.value = '编辑话题'
  currentEditTopic.value = {
    coverImage: topic.coverImage || '',
    topicName: topic.title,
    description: topic.description,
    topicId: topic.id
  }
  showTopicDialog.value = true
}

// 话题表单提交
const handleTopicFormConfirm = async (data) => {
  try {
    if (isEdit.value) {
      // 编辑话题
      await updateTopic(currentEditTopic.value.topicId, {
        title: data.topicName,
        description: data.description,
        cover_image: data.coverImage
      })
      ElMessage.success('编辑成功')
    } else {
      // 创建话题
      await createTopic({
        title: data.topicName,
        description: data.description,
        cover_image: data.coverImage
      })
      ElMessage.success('创建成功')
    }
    showTopicDialog.value = false
    fetchTopicsList()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

// 处理管理内容
const handleManageContent = (topic) => {
  router.push(`/topics/${topic.id}/content`)
}

// 处理删除话题
const handleDeleteTopic = (topic) => {
  currentEditTopic.value = topic
  showDeleteDialog.value = true
}

// 确认删除
const handleDeleteConfirm = async () => {
  try {
    await deleteTopic(currentEditTopic.value.id)
    ElMessage.success('删除成功')
    showDeleteDialog.value = false
    fetchTopicsList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchTopicsList()
})
</script>

<style scoped>
.topics-management {
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

.header-section {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.create-topic-btn {
  width: 120px;
  height: 44px;
  line-height: 44px;
  background: linear-gradient(90deg, #FFBD39 0%, #FF7800 100%);
  border-radius: 4px;
  font-weight: 400;
  font-size: 14px;
  color: #FFFFFF;
  text-align: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.3s;
}

.create-topic-btn:hover {
  opacity: 0.9;
}

.create-topic-btn:active {
  opacity: 0.8;
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 16px; /* 行间距 列间距 */
  row-gap: 12px; /* 减小上下间距 */
  margin-bottom: 20px;
  /* flex: 1; */
}

.topic-card {
  /* width: 380px; */
  height: 146px;
  padding: 16px;
  background: #ffffff;
  background: #FAFAFA;
  border-radius: 0px 0px 4px 4px;
}

/* .topic-card:hover {
  transform: translateY(-4px);
} */

.topic-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.topic-icon {
  padding: 0 6px;
  height: 18px;
  font-size: 18px;
  border-radius: 8px;
  flex-shrink: 0;
  color: #fff;
  background: linear-gradient( 46deg, #FF4400 0%, #FFA600 100%);
}

.topic-info {
  flex: 1;
  min-width: 0;
}

.topic-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-description {
  font-size: 14px;
  color: #999;
  margin: 0;
  line-height: 1.6;
  height: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.topic-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* padding-top: 12px; */
  /* border-top: 1px solid #f0f0f0; */
}

.topic-stats {
  flex: 1;
}

.stats-text {
  font-size: 13px;
  color: #999;
}

.pagination {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 1400px) {
  .topics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .topics-grid {
    grid-template-columns: 1fr;
  }
}
</style>


