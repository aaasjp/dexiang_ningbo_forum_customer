<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <h2 class="page-title">数据看板</h2>

    <!-- 白色背景区块 -->
    <div class="content-wrapper">
      <!-- 时间筛选 -->
      <div class="filter-section">
        <el-select v-model="timeRange" placeholder="请选择时间" style="width: 200px; height: 44px" class="custom-select">
          <el-option label="全部时间" value="all" />
          <el-option label="今天" value="today" />
          <el-option label="本周" value="week" />
          <el-option label="本月" value="month" />
        </el-select>
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

const timeRange = ref('all')
const loading = ref(false)
const stats = ref({
  activeUsers: '0',
  questions: '0',
  answers: '0',
  resolutionRate: '0%'
})
const departments = ref([])
const topTopics = ref([])

// 获取时间范围参数
const getTimeParams = () => {
  const now = new Date()
  let start_time = null
  let end_time = null

  switch (timeRange.value) {
    case 'today':
      start_time = new Date(now.setHours(0, 0, 0, 0)).toISOString()
      end_time = new Date(now.setHours(23, 59, 59, 999)).toISOString()
      break
    case 'week':
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
      start_time = new Date(weekStart.setHours(0, 0, 0, 0)).toISOString()
      end_time = new Date().toISOString()
      break
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      start_time = monthStart.toISOString()
      end_time = new Date().toISOString()
      break
    default:
      return {}
  }

  return { start_time, end_time }
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
    loading.value = true
    const params = getTimeParams()
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
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 监听时间范围变化
watch(timeRange, () => {
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
  width: 32px;
  height: 32px;
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
</style>


