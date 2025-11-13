<template>
  <div class="points-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="header-title">积分</div>
      <div class="rules-link" @click="goToRules">积分规则</div>
    </div>

    <!-- 积分卡片 -->
    <div class="points-banner">
      <div class="points-label">我的积分</div>
      <div class="points-value">{{ totalPoints }}</div>
      <div class="points-decoration">
        <!-- 装饰图案 -->
        <div class="coin coin-1">🪙</div>
        <div class="coin coin-2">🪙</div>
        <div class="star">⭐</div>
      </div>
    </div>

    <!-- 积分记录列表 -->
    <div class="points-records">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="pointRecords.length === 0" class="empty">暂无积分记录</div>
      <div
        v-else
        v-for="record in pointRecords"
        :key="record.record_id"
        class="record-item"
      >
        <div class="record-info">
          <div class="record-title">{{ record.description }}</div>
          <div class="record-date">{{ formatDate(record.create_time) }}</div>
        </div>
        <div 
          class="record-points"
          :class="{ 'points-positive': record.points > 0, 'points-negative': record.points < 0 }"
        >
          {{ record.points > 0 ? '+' : '' }}{{ record.points }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getUserPoints, type PointRecord } from '../../api/user'

const router = useRouter()

// 积分数据
const totalPoints = ref(0)
const pointRecords = ref<PointRecord[]>([])
const loading = ref(false)

// 加载积分数据
const loadPoints = async () => {
  try {
    loading.value = true
    const res = await getUserPoints(1, 50)
    if (res.code === 200) {
      totalPoints.value = res.data.total_points
      pointRecords.value = res.data.records
    } else {
      //ElMessage.error(res.message || '获取积分失败')
    }
  } catch (error) {
    console.error('获取积分失败:', error)
    //ElMessage.error('获取积分失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadPoints()
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到积分规则页
const goToRules = () => {
  router.push('/profile/points/rules')
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}
</script>

<style scoped>
.points-page {
  width: 100%;
  
  min-height: 100vh;
  background: #F5F5F5;
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
}

.rules-link {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  flex-shrink: 0;
}

.rules-link:active {
  color: #333;
}

/* 积分卡片 */
.points-banner {
  background: linear-gradient(135deg, #FFE8B3 0%, #FFD88A 100%);
  padding: 40px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 16px;
}

.points-label {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 16px;
  color: #8B6914;
  margin-bottom: 12px;
}

.points-value {
  font-family: PingFang SC, PingFang SC;
  font-weight: 700;
  font-size: 56px;
  color: #1A1A1A;
  letter-spacing: 2px;
}

.points-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.coin {
  position: absolute;
  font-size: 32px;
  opacity: 0.6;
}

.coin-1 {
  top: 20px;
  right: 40px;
  transform: rotate(15deg);
}

.coin-2 {
  bottom: 30px;
  left: 30px;
  transform: rotate(-20deg);
}

.star {
  position: absolute;
  top: 50%;
  right: 60px;
  transform: translateY(-50%) rotate(20deg);
  font-size: 48px;
  opacity: 0.5;
}

/* 积分记录列表 */
.points-records {
  background: #fff;
  padding: 0;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #F5F5F5;
}

.record-item:last-child {
  border-bottom: none;
}

.record-info {
  flex: 1;
  min-width: 0;
}

.record-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.record-date {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999999;
}

.record-points {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
  margin-left: 12px;
}

.points-positive {
  color: #2EC84F;
}

.points-negative {
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
