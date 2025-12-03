<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <h2 class="page-title">数据看板</h2>

    <!-- 白色背景区块 -->
    <div class="content-wrapper">
      <!-- 时间筛选 -->
      <div class="filter-section">
        <el-select v-model="timeRange" placeholder="请选择时间" style="width: 200px; height: 44px" class="custom-select">
          <el-option label="今日" value="today" />
          <el-option label="最近一周" value="week" />
          <el-option label="最近一个月" value="month" />
          <el-option label="自由选时间" value="custom" />
        </el-select>
        <el-date-picker
          v-if="timeRange === 'custom'"
          v-model="customDateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="margin-left: 12px; width: 380px; height: 44px;"
          class="custom-date-picker"
          :disabled-date="disabledDate"
          @change="handleCustomDateChange"
        />
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">- 用户活跃数 -</div>
        <div class="stat-value">{{ stats.activeUsers }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">- 问题数 -</div>
        <div class="stat-value">{{ stats.questions }}</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-label">- 回答数 -</div>
        <div class="stat-value">{{ stats.answers }}</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">- 问题解决率 -</div>
        <div class="stat-value">{{ stats.resolutionRate }}</div>
      </div>
    </div>

    <!-- 部门数据表格 -->
    <div class="section">
      <h3 class="section-title">部门数据</h3>
      <el-table :data="departments" style="width: 100%" class="department-table">
        <el-table-column prop="name" label="部门" width="150" />
        <el-table-column prop="atCount" label="@总数" align="center" />
        <el-table-column prop="replyCount" label="回复数" align="center" />
        <el-table-column prop="replyRate" label="回复率" align="center" />
        <el-table-column prop="resolvedCount" label="解决数" align="center" />
        <el-table-column prop="resolvedRate" label="解解率" align="center" />
        <el-table-column prop="overdueCount" label="超时（条）" align="center" />
        <el-table-column prop="avgResponseTime" label="平均回复时长" align="center" />
      </el-table>
    </div>

      <!-- 话题排行榜 -->
      <div class="section">
        <h3 class="section-title">话题排行榜</h3>
        <div class="topic-list">
          <div
            v-for="topic in topTopics"
            :key="topic.rank"
            class="topic-item"
            :class="getTopicItemClass(topic.rank)"
          >
            <div class="topic-rank" :class="getRankClass(topic.rank)">
              {{ topic.rank }}
            </div>
            <div class="topic-title">{{ topic.title }}</div>
            <div class="topic-heat" :class="getHeatClass(topic.rank)">
              {{ topic.heat }}
            </div>
            <div style="width: 40%;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getDashboardData } from '@/api/dashboard'
import { ElMessage } from 'element-plus'

const timeRange = ref('today')
const customDateRange = ref(null)
const loading = ref(false)
const stats = ref({
  activeUsers: '0',
  questions: '0',
  answers: '0',
  resolutionRate: '0%'
})
const departments = ref([])
const topTopics = ref([])

// 格式化日期时间为 YYYY-MM-DD HH:mm:ss 格式
const formatDateTime = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取时间范围参数
const getTimeParams = () => {
  const now = new Date()
  let start_time = null
  let end_time = null

  switch (timeRange.value) {
    case 'today':
      // 今日：当天 00:00:00 到当前时间
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      start_time = formatDateTime(todayStart)
      end_time = formatDateTime(now)
      break
    case 'week':
      // 最近一周：7天前的 00:00:00 到当前时间
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0)
      start_time = formatDateTime(weekStart)
      end_time = formatDateTime(now)
      break
    case 'month':
      // 最近一个月：30天前的 00:00:00 到当前时间
      const monthStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0)
      start_time = formatDateTime(monthStart)
      end_time = formatDateTime(now)
      break
    case 'custom':
      // 自由选时间：使用用户选择的时间范围
      if (customDateRange.value && customDateRange.value.length === 2) {
        start_time = customDateRange.value[0]
        end_time = customDateRange.value[1]
      } else {
        // 未选择时间时，不发送请求
        return null
      }
      break
    default:
      return {}
  }

  return { start_time, end_time }
}

// 处理自定义日期变化
const handleCustomDateChange = () => {
  if (customDateRange.value && customDateRange.value.length === 2) {
    fetchDashboardData()
  }
}

// 禁止选择今天之后的日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return String(num)
}

// 获取 Dashboard 数据
const fetchDashboardData = async () => {
  try {
    const params = getTimeParams()
    // 如果是自定义时间但未选择时间范围，则不发送请求
    if (params === null) {
      return
    }
    loading.value = true
    const res = await getDashboardData(params)
    
    if (res.data) {
      // 更新统计数据
      stats.value = {
        activeUsers: formatNumber(res.data.user_active_count || 0),
        questions: formatNumber(res.data.question_count || 0),
        answers: formatNumber(res.data.answer_count || 0),
        resolutionRate: (res.data.resolution_rate || 0).toFixed(1) + '%'
      }
      
      // 更新部门数据
      departments.value = (res.data.department_stats || []).map(dept => ({
        name: dept.dept_name,
        atCount: dept.total_count || 0,
        replyCount: dept.reply_count || 0,
        replyRate: (dept.reply_rate || 0).toFixed(0) + '%',
        resolvedCount: dept.resolved_count || 0,
        resolvedRate: (dept.resolution_rate || 0).toFixed(0) + '%',
        overdueCount: dept.timeout_count || 0,
        avgResponseTime: (dept.avg_reply_time || 0).toFixed(1) + '小时'
      }))
      
      // 更新话题排行榜
      topTopics.value = (res.data.topic_ranking || []).map((topic, index) => ({
        rank: index + 1,
        title: '#' + topic.title,
        heat: formatNumber(topic.popularity || 0) + '热度'
      }))
    }
  } catch (error) {
    console.error('获取 Dashboard 数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听时间范围变化
watch(timeRange, (newVal) => {
  // 如果切换到自定义模式，需要等用户选择时间后再请求
  if (newVal === 'custom') {
    // 清空之前的自定义时间选择
    customDateRange.value = null
    return
  }
  fetchDashboardData()
})

// 组件挂载时获取数据
onMounted(() => {
  fetchDashboardData()
})

const getRankClass = (rank) => {
  if (rank <= 3) return `rank-${rank}`
  return ''
}

const getHeatClass = (rank) => {
  if (rank <= 3) return `heat-${rank}`
  return ''
}

const getTopicItemClass = (rank) => {
  if (rank === 1) return 'topic-item-1'
  if (rank === 2) return 'topic-item-2'
  if (rank === 3) return 'topic-item-3'
  return ''
}
</script>

<style scoped>
.dashboard {
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
}

.filter-section {
  margin-bottom: 24px;
  /* display: flex; */
  /* align-items: center; */
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  height: 120px;
  background: #fff9f0;
}

.stat-card.blue {
  background: #e6f7ff;
}

.stat-card.purple {
  background: #f0f0ff;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #1A1A1A;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

/* 部门数据表格样式 */
.department-table :deep(.el-table__header-wrapper) {
  background: #f5f5f5;
}

.department-table :deep(.el-table__header th) {
  background: #f5f5f5 !important;
}

.department-table :deep(.el-table__row) {
  background: #ffffff;
}

.department-table :deep(.el-table__row--striped) {
  background: #ffffff;
}

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.topic-item {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  background: transparent;
  position: relative;
}

.topic-item-1::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 240px;
  height: 100%;
  background: linear-gradient(90deg, #FFF0F0 0%, rgba(255,240,240,0) 100%);
  z-index: 0;
}

.topic-item-2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 240px;
  height: 100%;
  background: linear-gradient(90deg, #FFE7D2 0%, rgba(255,231,210,0) 100%);
  z-index: 0;
}

.topic-item-3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 240px;
  height: 100%;
  background: linear-gradient(90deg, #FFF4DB 0%, rgba(255,244,219,0) 100%);
  z-index: 0;
}

.topic-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  background: #f0f0f0;
  border-radius: 4px;
  margin-right: 16px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.topic-rank.rank-1 {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: #ffffff;
}

.topic-rank.rank-2 {
  background: linear-gradient(135deg, #ffa500 0%, #ffb347 100%);
  color: #ffffff;
}

.topic-rank.rank-3 {
  background: linear-gradient(135deg, #ffd700 0%, #ffe44d 100%);
  color: #ffffff;
}

.topic-title {
  flex: 1;
  font-size: 14px;
  color: #1A1A1A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  z-index: 1;
}

.topic-heat {
  font-size: 14px;
  color: #999;
  margin-left: 16px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.topic-heat.heat-1 {
  color: #ff6b6b;
  font-weight: 600;
}

.topic-heat.heat-2 {
  color: #ffa500;
  font-weight: 600;
}

.topic-heat.heat-3 {
  color: #ffd700;
  font-weight: 600;
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

/* 自定义日期选择器样式 */
.custom-date-picker :deep(.el-input__wrapper) {
  height: 44px !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
}

.custom-date-picker :deep(.el-range-input) {
  font-size: 14px;
}

.custom-date-picker :deep(.el-range-separator) {
  color: #999;
}
</style>


