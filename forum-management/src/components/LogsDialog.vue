<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="custom-dialog-overlay" @click.self="handleCancel">
      <div class="custom-dialog" :style="{ width: width }">
        <!-- Header -->
        <div class="custom-dialog-header">
          <div class="custom-dialog-title">{{ title }}</div>
          <button class="custom-dialog-close" @click="handleCancel">
            <svg viewBox="0 0 1024 1024" width="16" height="16">
              <path fill="currentColor" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path>
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="custom-dialog-body" style="padding-top: 54px;">
          <!-- 搜索区 -->
          <div class="filter-section">
            <el-input
              v-model="searchUserCode"
              placeholder="请输入用户工号"
              style="width: 200px; height: 44px"
              class="custom-input"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #suffix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button 
              type="primary" 
              class="search-btn" 
              @click="handleSearch"
              :loading="loading"
            >
              搜索
            </el-button>
          </div>

          <!-- 表格 -->
          <div class="table-section">
            <el-table 
              :data="logsList" 
              style="width: 100%" 
              class="logs-table"
              v-loading="loading"
            >
              <el-table-column prop="sequence" label="序号" width="80" align="center" />
              <el-table-column prop="user_code" label="用户工号" width="120" />
              <el-table-column prop="user_name" label="用户姓名" width="120" />
              <el-table-column prop="operation_type" label="操作类型" width="200" />
              <el-table-column prop="content" label="操作内容" min-width="200" show-overflow-tooltip />
              <!-- <el-table-column prop="ip_address" label="IP地址" width="140" /> -->
              <el-table-column prop="create_time" label="操作时间" width="180">
                <template #default="{ row }">
                  <span>{{ formatTime(row.create_time) }}</span>
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
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getLogsList } from '@/api/logs'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '操作记录'
  },
  width: {
    type: String,
    default: '1200px'
  }
})

const emit = defineEmits(['update:modelValue', 'cancel'])

const visible = ref(props.modelValue)
const searchUserCode = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const logsList = ref([])
const loading = ref(false)

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    // 弹框打开时重置并加载数据
    resetSearch()
    fetchLogsList()
  }
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 操作类型格式化
const formatOperationType = (type) => {
  const typeMap = {
    'question_delete': '删除问题',
    'question_create': '创建问题',
    'question_update': '更新问题',
    'answer_delete': '删除回答',
    'answer_create': '创建回答',
    'answer_update': '更新回答',
    'comment_delete': '删除评论',
    'comment_create': '创建评论',
    'user_forbidden': '禁用用户',
    'user_unforbidden': '启用用户',
    'points_adjust': '调整积分',
    'role_change': '变更角色',
    'admin_add': '添加管理员',
    'admin_remove': '移除管理员'
  }
  return typeMap[type] || type
}

// 时间格式化
const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 获取日志列表
const fetchLogsList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    
    if (searchUserCode.value) {
      params.user_code = searchUserCode.value.trim()
    }
    
    const res = await getLogsList(params)
    
    if (res.data && res.data.items) {
      logsList.value = res.data.items.map((item, index) => ({
        ...item,
        sequence: (currentPage.value - 1) * pageSize.value + index + 1
      }))
      
      total.value = res.data.total || 0
    } else {
      logsList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取操作日志失败:', error)
    //ElMessage.error('获取操作日志失败')
    logsList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchLogsList()
}

// 重置搜索
const resetSearch = () => {
  searchUserCode.value = ''
  currentPage.value = 1
  pageSize.value = 10
}

// 分页变化
const handleSizeChange = () => {
  currentPage.value = 1
  fetchLogsList()
}

const handleCurrentChange = () => {
  fetchLogsList()
}

// 取消/关闭
const handleCancel = () => {
  emit('cancel')
  visible.value = false
}
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
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
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
  padding: 24px 40px 40px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 搜索区 */
.filter-section {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 自定义输入框样式 */
.custom-input :deep(.el-input__wrapper) {
  height: 44px !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
}

.custom-input :deep(.el-input__inner) {
  height: 42px !important;
  line-height: 42px !important;
}

/* 搜索按钮 */
.search-btn {
  height: 44px;
  padding: 0 20px;
  background: #FF7800;
  border: none;
  color: #FFFFFF;
  border-radius: 4px;
  font-size: 14px;
}

.search-btn:hover {
  background: #FF8C1A;
}

.search-btn:active {
  background: #E66D00;
}

/* 表格区 */
.table-section {
  flex: 1;
  overflow: auto;
  margin-bottom: 24px;
}

/* 表格样式 */
.logs-table {
  font-size: 14px;
}

.logs-table :deep(.el-table__header-wrapper) {
  background-color: #fafafa;
}

.logs-table :deep(.el-table__header) {
  background-color: #fafafa;
}

.logs-table :deep(.el-table__header th) {
  background-color: #fafafa;
  color: #1a1a1a;
  font-weight: 500;
  font-size: 14px;
}

.logs-table :deep(.el-table__body-wrapper .el-table__row) {
  font-size: 14px;
  color: #595959;
}

.logs-table :deep(.el-table__body-wrapper .el-table__row:hover) {
  background-color: #fafafa;
}

.logs-table :deep(.el-table__cell) {
  padding: 12px 0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  margin-top: auto;
}

.custom-pagination :deep(.el-pagination__total) {
  color: #595959;
  font-size: 14px;
}

.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next),
.custom-pagination :deep(.el-pager li) {
  background-color: transparent;
  color: #595959;
  font-size: 14px;
  min-width: 32px;
  height: 32px;
  line-height: 32px;
}

.custom-pagination :deep(.el-pager li.is-active) {
  color: #FF7800;
  font-weight: 500;
}

.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover),
.custom-pagination :deep(.el-pager li:hover) {
  color: #FF7800;
}

.custom-pagination :deep(.el-select .el-input__wrapper) {
  height: 32px;
}

.custom-pagination :deep(.el-select .el-input__inner) {
  height: 30px;
  line-height: 30px;
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
</style>

