<template>
  <div class="logs-page">
    <!-- 页面标题 -->
    <h2 class="page-title">操作记录管理</h2>

    <!-- 白色背景区块 -->
    <div class="content-wrapper">
      <!-- 说明文字 -->
      <div class="description">
        <p>点击下方按钮查看系统操作记录，支持按用户工号搜索和分页浏览。</p>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button 
          type="primary" 
          class="primary-btn"
          @click="openLogsDialog"
        >
          查看操作记录
        </el-button>
      </div>
    </div>

    <!-- 操作记录弹框 -->
    <LogsDialog 
      v-model="logsDialogVisible"
      title="操作记录"
      width="1200px"
      @cancel="handleDialogCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LogsDialog from '@/components/LogsDialog.vue'

const logsDialogVisible = ref(false)

const openLogsDialog = () => {
  console.log('Logs.vue - 打开弹框')
  logsDialogVisible.value = true
  console.log('Logs.vue - logsDialogVisible:', logsDialogVisible.value)
}

const handleDialogCancel = () => {
  console.log('操作记录弹框已关闭')
}
</script>

<style scoped>
.logs-page {
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

.description {
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.description p {
  margin: 0;
  font-size: 14px;
  color: #595959;
  line-height: 22px;
}

.action-section {
  display: flex;
  gap: 12px;
}

.primary-btn {
  height: 44px;
  padding: 0 24px;
  background: #FF7800;
  border: none;
  color: #FFFFFF;
  border-radius: 4px;
  font-size: 14px;
}

.primary-btn:hover {
  background: #FF8C1A;
}

.primary-btn:active {
  background: #E66D00;
}
</style>

