<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="custom-dialog-overlay" @click.self="handleClose">
      <div class="custom-dialog">
        <!-- Header -->
        <div class="custom-dialog-header">
          <div class="custom-dialog-title">回答列表</div>
          <button class="custom-dialog-close" @click="handleClose">
            <svg viewBox="0 0 1024 1024" width="16" height="16">
              <path fill="currentColor" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path>
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="custom-dialog-body" ref="scrollContainer" @scroll="handleScroll">
          <div v-if="loading && answerList.length === 0" class="loading-container">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          
          <div v-else-if="answerList.length === 0" class="empty-container">
            <div class="empty-text">暂无回答</div>
          </div>

          <!-- 回答列表 -->
          <div v-else class="answer-list">
            <div 
              v-for="answer in answerList" 
              :key="answer.answer_id" 
              class="answer-item"
            >
              <!-- 回答者信息 -->
              <div class="answer-header">
                <div class="answerer-info">
                  <span class="answerer-name">{{ answer.answerer_name }}回答：</span>
                  <span v-if="answer.is_anonymous" class="real-identity">
                    ({{ answer.answerer_code }})
                  </span>
                </div>
                <el-popconfirm
                  title="确定删除该回答吗？"
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                  @confirm="handleDelete(answer)"
                  width="200"
                >
                  <template #reference>
                    <button class="delete-btn">
                      <svg viewBox="0 0 1024 1024" width="16" height="16">
                        <path fill="currentColor" d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V448a32 32 0 0 1 64 0v288a32 32 0 0 1-32 32zm192 0a32 32 0 0 1-32-32V448a32 32 0 0 1 64 0v288a32 32 0 0 1-32 32z"></path>
                      </svg>
                    </button>
                  </template>
                </el-popconfirm>
              </div>

              <!-- 回答内容 -->
              <div class="answer-content">
                <div class="content-text">{{ answer.content }}</div>
                <!-- 图片展示 -->
                <div v-if="answer.images && answer.images.length > 0" class="content-images">
                  <img 
                    v-for="(image, imgIndex) in answer.images" 
                    :key="imgIndex"
                    :src="image" 
                    class="content-image"
                    @click="previewImage(image)"
                  />
                </div>
              </div>
            </div>

            <!-- 加载更多提示 -->
            <div v-if="loading && answerList.length > 0" class="loading-more">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
            <div v-else-if="!hasMore" class="no-more">没有更多了</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="custom-dialog-footer">
          <button class="cancel-btn" @click="handleClose">取消</button>
          <button class="download-btn" @click="handleExport" :disabled="exporting">
            {{ exporting ? '导出中...' : '下载' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { getAnswersList, deleteAnswerById, exportAnswers } from '@/api/content'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  questionId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
const loading = ref(false)
const exporting = ref(false)
const answerList = ref([])
const currentPage = ref(1)
const pageSize = ref(50)
const total = ref(0)
const hasMore = ref(true)
const scrollContainer = ref(null)

// 获取回答列表
const fetchAnswersList = async (append = false) => {
  if (!props.questionId || loading.value) return

  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }

    const res = await getAnswersList(props.questionId, params)

    if (res.data && res.data.items) {
      const newItems = res.data.items.map((item) => ({
        answer_id: item.answer_id,
        answerer_code: item.answerer_code,
        answerer_name: item.answerer_name,
        content: item.content,
        is_anonymous: item.is_anonymous,
        like_count: item.like_count || 0,
        images: item.images || [],
        create_time: new Date(item.create_time).toLocaleString('zh-CN')
      }))

      if (append) {
        answerList.value = [...answerList.value, ...newItems]
      } else {
        answerList.value = newItems
      }

      total.value = res.data.total || 0
      hasMore.value = answerList.value.length < total.value
    }
  } catch (error) {
    console.error('获取回答列表失败:', error)
    ElMessage.error('获取回答列表失败')
  } finally {
    loading.value = false
  }
}

// 滚动加载
const handleScroll = () => {
  if (!scrollContainer.value || loading.value || !hasMore.value) return

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  // 距离底部100px时加载更多
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    currentPage.value++
    fetchAnswersList(true)
  }
}

// 删除回答
const handleDelete = async (answer) => {
  try {
    await deleteAnswerById(answer.answer_id)
    ElMessage.success('删除成功')
    
    // 从列表中移除该项
    const index = answerList.value.findIndex(item => item.answer_id === answer.answer_id)
    if (index > -1) {
      answerList.value.splice(index, 1)
      total.value--
    }

    // 如果当前列表少于10条且还有更多数据，尝试加载更多
    if (answerList.value.length < 10 && hasMore.value) {
      fetchAnswersList(true)
    }
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

// 预览图片
const previewImage = (imageUrl) => {
  // TODO: 实现图片预览功能
  window.open(imageUrl, '_blank')
}

// 导出回答列表
const handleExport = async () => {
  if (!props.questionId) {
    ElMessage.warning('问题ID不存在')
    return
  }

  try {
    exporting.value = true
    ElMessage.info('正在导出，请稍候...')
    
    const res = await exportAnswers(props.questionId)
    
    // 创建下载链接
    const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    
    // 生成文件名：回答列表_问题ID_YYYYMMDD_HHMMSS.csv
    const now = new Date()
    const dateStr = now.getFullYear() + 
                   String(now.getMonth() + 1).padStart(2, '0') + 
                   String(now.getDate()).padStart(2, '0') + '_' +
                   String(now.getHours()).padStart(2, '0') + 
                   String(now.getMinutes()).padStart(2, '0') + 
                   String(now.getSeconds()).padStart(2, '0')
    link.download = `回答列表_${props.questionId}_${dateStr}.csv`
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// 关闭弹框
const handleClose = () => {
  visible.value = false
}

// 重置状态
const resetState = () => {
  answerList.value = []
  currentPage.value = 1
  total.value = 0
  hasMore.value = true
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal && props.questionId) {
    resetState()
    nextTick(() => {
      fetchAnswersList(false)
    })
  }
})

// 监听 visible 变化
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal) {
    resetState()
  }
})

// 监听问题ID变化
watch(() => props.questionId, (newVal) => {
  if (newVal && visible.value) {
    resetState()
    fetchAnswersList(false)
  }
})
</script>

<style scoped>
/* 遮罩层 */
.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* 弹框主体 */
.custom-dialog {
  width: 1200px;
  max-width: 90vw;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

/* Header */
.custom-dialog-header {
  padding: 20px 40px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.custom-dialog-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 24px;
}

.custom-dialog-close {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  transition: color 0.3s;
}

.custom-dialog-close:hover {
  color: #fa8c16;
}

/* Body */
.custom-dialog-body {
  padding: 24px 40px;
  overflow-y: auto;
  flex: 1;
  min-height: 400px;
  max-height: calc(90vh - 160px);
}

/* 加载和空状态 */
.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #999;
  gap: 12px;
}

.loading-container .el-icon {
  font-size: 32px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

/* 回答列表 */
.answer-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 回答项 */
.answer-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 回答头部 */
.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.answerer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.answerer-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.real-identity {
  font-size: 12px;
  color: #999999;
}

.delete-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  transition: color 0.3s;
}

.delete-btn:hover {
  color: #ff4d4f;
}

/* 回答内容 */
.answer-content {
  background: #F5F5F5;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-text {
  font-size: 14px;
  color: #4D4D4D;
  line-height: 22px;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
}

/* 图片展示 */
.content-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.content-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  cursor: pointer;
  object-fit: cover;
  transition: transform 0.2s;
}

.content-image:hover {
  transform: scale(1.05);
}

/* 加载更多 */
.loading-more,
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}

.loading-more .el-icon {
  font-size: 16px;
}

/* Footer */
.custom-dialog-footer {
  padding: 16px 40px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.cancel-btn {
  width: 120px;
  height: 44px;
  background: #FAFAFA;
  border: 1px solid #D9D9D9;
  color: #4D4D4D;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #F0F0F0;
  border-color: #BFBFBF;
}

.download-btn {
  width: 120px;
  height: 44px;
  background: linear-gradient(90deg, #FFBD39 0%, #FF7800 100%);
  border: none;
  color: #FFFFFF;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.download-btn:disabled {
  background: #F5F5F5;
  color: #BFBFBF;
  cursor: not-allowed;
}

.download-btn:not(:disabled):hover {
  opacity: 0.9;
}

/* 动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s;
}

.dialog-fade-enter-active .custom-dialog,
.dialog-fade-leave-active .custom-dialog {
  transition: transform 0.3s;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .custom-dialog,
.dialog-fade-leave-to .custom-dialog {
  transform: scale(0.9);
}

/* Loading 动画 */
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

