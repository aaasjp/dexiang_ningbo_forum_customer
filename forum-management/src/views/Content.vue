<template>
  <div class="content-management">
    <!-- 页面标题 -->
    <h2 class="page-title">内容管理</h2>

    <!-- 白色背景区块 -->
    <div class="content-wrapper">
      <!-- 筛选区 -->
      <div class="filter-section">
        <div class="filter-left">
          <el-select v-model="selectedType" placeholder="全部类型" style="width: 200px; height: 44px" class="custom-select">
            <el-option label="全部类型" value="" />
            <el-option label="问题" value="question" />
            <el-option label="文章" value="article" />
            <template #suffix>
              <el-icon><ArrowDown /></el-icon>
            </template>
          </el-select>
          
          <el-select v-model="selectedStatus" placeholder="全部状态" style="width: 200px; margin-left: 16px; height: 44px" class="custom-select">
            <el-option label="全部状态" value="" />
            <el-option label="已上线" value="online" />
            <el-option label="已下线" value="offline" />
            <template #suffix>
              <el-icon><ArrowDown /></el-icon>
            </template>
          </el-select>

          <div class="date-picker-wrapper" style="position: relative; display: inline-block; margin-left: 16px;">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="2014.12.09"
              end-placeholder="2025.08.22"
              style="width: 280px; height: 44px"
              class="custom-date-picker"
              :clearable="false"
            />
            <el-icon class="custom-suffix-icon"><ArrowDown /></el-icon>
          </div>

          <el-input
            v-model="searchKeyword"
            placeholder="搜索关键词"
            style="width: 200px; margin-left: 16px; height: 44px"
            class="custom-input"
            clearable
          >
            <template #suffix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="operation-record">操作记录</div>
      </div>

      <!-- 表格 -->
      <div class="table-section">
      <el-table :data="contentList" style="width: 100%" class="content-table">
        <el-table-column prop="sequence" label="序号" width="80" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="department" label="@部门" width="150">
          <template #default="{ row }">
            <el-select v-model="row.department" size="small">
              <el-option :label="row.department" :value="row.department" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="topic" label="所属话题" width="150">
          <template #default="{ row }">
            <el-select v-model="row.topic" size="small">
              <el-option :label="row.topic" :value="row.topic" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览" width="80" align="center" />
        <el-table-column prop="replies" label="回答" width="80" align="center" />
        <el-table-column prop="likes" label="点赞" width="80" align="center" />
        <el-table-column prop="favorites" label="收藏" width="80" align="center" />
        <el-table-column prop="countdown" label="倒计时" width="100" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span :class="['status-tag', row.status === 'online' ? 'status-online' : 'status-offline']">
              {{ row.status === 'online' ? '已上线' : '已下线' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip
                :content="row.status === 'online' ? '下线' : '上线'"
                placement="top"
                effect="dark"
                popper-class="switch-tooltip"
              >
                <el-switch
                  v-model="row.status"
                  active-value="online"
                  inactive-value="offline"
                  style="--el-switch-on-color: #fa8c16"
                  @change="handleStatusChange(row)"
                />
              </el-tooltip>
              <el-button link type="warning">编辑</el-button>
              <el-button link type="info">详情</el-button>
              <el-dropdown @command="(cmd) => { currentDeleteId = row.id; handleCommand(cmd); }" popper-class="dark-dropdown">
                <el-icon class="more-icon" style="color: #999;"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="delete">删除内容</el-dropdown-item>
                    <el-dropdown-item command="manage">管理内容</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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

    <!-- 删除确认弹框 -->
    <DeleteConfirmDialog
      v-model="showDeleteDialog"
      message="确定删除该任务吗？"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Search, MoreFilled, ArrowDown } from '@element-plus/icons-vue'
import { getQuestionsList, deleteQuestion, updateOfflineStatus, transferQuestion } from '@/api/content'
import { getDepartmentTree } from '@/api/department'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.vue'
import { ElMessage } from 'element-plus'

const selectedType = ref('')
const selectedStatus = ref('')
const dateRange = ref(['2014-12-09', '2025-08-22'])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const contentList = ref([])
const showDeleteDialog = ref(false)
const currentDeleteId = ref(null)
const loading = ref(false)
const departments = ref([])

// 获取部门列表
const fetchDepartments = async () => {
  try {
    const res = await getDepartmentTree({})
    if (res.data && res.data.departments) {
      departments.value = res.data.departments
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

// 状态映射
const statusMap = {
  'online': 0, // 已上线对应状态0(待解决)
  'offline': 3  // 已下线对应状态3(已关闭)
}

// 计算倒计时
const calculateCountdown = (deadline) => {
  if (!deadline) return '-'
  const now = new Date()
  const end = new Date(deadline)
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  if (diff < 0) return '已超时'
  return `${diff}天`
}

// 获取问题列表
const fetchQuestionsList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    
    if (selectedStatus.value) {
      params.status = statusMap[selectedStatus.value]
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_time = new Date(dateRange.value[0]).toISOString()
      params.end_time = new Date(dateRange.value[1]).toISOString()
    }
    
    const res = await getQuestionsList(params)
    
    if (res.data && res.data.items) {
      contentList.value = res.data.items.map((item, index) => ({
        id: item.question_id,
        sequence: (currentPage.value - 1) * pageSize.value + index + 1,
        title: item.title,
        author: item.asker_name,
        department: item.related_depts && item.related_depts.length > 0 
          ? item.related_depts.map(d => d.dept_name).join('/')
          : '-',
        topic: item.topics && item.topics.length > 0 
          ? item.topics.map(t => '#' + t.title).join(' ')
          : '-',
        views: item.view_count || 0,
        replies: item.answer_count || 0,
        likes: item.like_count || 0,
        favorites: item.favorite_count || 0,
        countdown: calculateCountdown(item.deadline),
        createTime: new Date(item.create_time).toLocaleString('zh-CN'),
        status: item.is_offline === 1 ? 'offline' : 'online',
        questionData: item // 保存原始数据
      }))
      
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取问题列表失败:', error)
    ElMessage.error('获取问题列表失败')
  } finally {
    loading.value = false
  }
}

// 监听筛选条件变化
watch([selectedType, selectedStatus, searchKeyword, dateRange], () => {
  currentPage.value = 1
  fetchQuestionsList()
})

// 监听分页变化
watch([currentPage, pageSize], () => {
  fetchQuestionsList()
})

// 处理状态切换
const handleStatusChange = async (row) => {
  try {
    const isOffline = row.status === 'offline' ? 1 : 0
    await updateOfflineStatus(row.id, isOffline)
    ElMessage.success(isOffline === 1 ? '已下线' : '已上线')
    fetchQuestionsList()
  } catch (error) {
    console.error('更新状态失败:', error)
    // 恢复原状态
    row.status = row.status === 'offline' ? 'online' : 'offline'
  }
}

const handleCommand = (command) => {
  if (command === 'delete') {
    showDeleteDialog.value = true
  } else if (command === 'manage') {
    console.log('管理内容')
  }
}

const handleDeleteConfirm = async () => {
  if (!currentDeleteId.value) return
  
  try {
    await deleteQuestion(currentDeleteId.value)
    ElMessage.success('删除成功')
    showDeleteDialog.value = false
    currentDeleteId.value = null
    fetchQuestionsList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const handleDeleteCancel = () => {
  showDeleteDialog.value = false
  currentDeleteId.value = null
}

// 组件挂载时获取数据
onMounted(() => {
  fetchDepartments()
  fetchQuestionsList()
})
</script>

<style scoped>
.content-management {
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

.filter-section {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.more-icon {
  cursor: pointer;
  font-size: 18px;
  color: #666;
}

.more-icon:hover {
  color: #fa8c16;
}

/* 表格样式 - 只有标题行灰色背景 */
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

/* 状态标签 */
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 12px;
}

.status-online {
  background: #e6f7ff;
  color: #1890ff;
}

.status-offline {
  background: #f5f5f5;
  color: #999;
}

.pagination {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.operation-record {
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
}

/* 自定义选择框样式 */
.custom-select :deep(.el-select__wrapper) {
  height: 44px !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
  padding-left: 11px !important;
}

.custom-select :deep(.el-input__wrapper) {
  height: 44px !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
  padding-left: 11px !important;
}

.custom-select :deep(.el-input__inner) {
  height: 42px !important;
  line-height: 42px !important;
}

.custom-select :deep(.el-input__prefix) {
  display: none !important;
}

.custom-select :deep(.el-input__suffix) {
  display: flex !important;
  align-items: center;
}

.custom-select :deep(.el-icon) {
  font-size: 14px !important;
  color: #999 !important;
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

/* 日期选择器包裹容器 */
.date-picker-wrapper {
  position: relative;
  display: inline-block;
}

/* 自定义日期选择器样式 */
.custom-date-picker :deep(.el-input__wrapper) {
  height: 44px !important;
  padding-left: 11px !important;
  padding-right: 35px !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
  flex-grow: 0 !important;
}

.custom-date-picker :deep(.el-range-input) {
  font-size: 14px;
  height: 42px !important;
  line-height: 42px !important;
}

.custom-date-picker :deep(.el-range-separator) {
  font-size: 14px;
  line-height: 42px !important;
  flex: none !important;
}

.custom-date-picker :deep(.el-input__prefix) {
  display: none !important;
}

.custom-date-picker :deep(.el-input__prefix-inner) {
  display: none !important;
}

.custom-date-picker :deep(.el-range__icon) {
  display: none !important;
}

.custom-date-picker :deep(.el-input__suffix) {
  display: none !important;
}

.custom-date-picker :deep(.el-input__suffix-inner) {
  display: none !important;
}

/* 自定义后缀图标 */
.custom-suffix-icon {
  position: absolute;
  right: 11px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #999;
  pointer-events: none;
  z-index: 1;
}
</style>

<style>
/* 全局样式 - Tooltip 黑色背景 */
.switch-tooltip.el-tooltip__popper.is-dark {
  background: #4D4D4D !important;
}

.switch-tooltip.el-tooltip__popper.is-dark .el-popper__arrow::before {
  background: #4D4D4D !important;
}

/* 全局样式 - Dropdown 黑色背景 */
.dark-dropdown.el-dropdown__popper {
  background: #4D4D4D !important;
}

.dark-dropdown .el-dropdown-menu {
  background: #4D4D4D !important;
  border: none !important;
}

.dark-dropdown .el-dropdown-menu__item {
  color: #ffffff !important;
}

.dark-dropdown .el-dropdown-menu__item:hover {
  background: #666666 !important;
  color: #ffffff !important;
}

.dark-dropdown .el-popper__arrow::before {
  background: #4D4D4D !important;
  border: none !important;
}

/* 全局样式 - 自定义日期选择器 */
.custom-date-picker .el-input__wrapper {
  padding-left: 11px !important;
  flex-grow: 0 !important;
}

.custom-date-picker .el-input__prefix {
  display: none !important;
}

.custom-date-picker .el-input__prefix-inner {
  display: none !important;
}

.custom-date-picker .el-range__icon {
  display: none !important;
}

.custom-date-picker .el-range-separator {
  flex: none !important;
}

.custom-date-picker .el-input__suffix {
  display: flex !important;
}

/* 全局样式 - 自定义选择框 */
.custom-select .el-select__wrapper {
  height: 44px !important;
  padding-left: 11px !important;
}

.custom-select .el-input__prefix {
  display: none !important;
}

.custom-select .el-input__wrapper {
  height: 44px !important;
  padding-left: 11px !important;
}
</style>


