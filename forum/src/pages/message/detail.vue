<template>
  <div class="message-detail-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="header-title">{{ messageTitle }}</div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="messageItems.length === 0" class="empty">暂无消息</div>
      <div
        v-else
        v-for="item in messageItems"
        :key="item.id"
        class="message-card"
        @click="handleItemClick(item)"
      >
        <!-- 顶部：标签和红点 -->
        <div v-if="messageType === 'department'" class="message-top">
          <div 
            class="message-tag"
            :class="{
              'tag-help': item.unread,
              'tag-suggest': !item.unread && item.id === '2',
              'tag-warning': !item.unread && item.id === '3'
            }"
          >
            {{ getTagText(item) }}
          </div>
          <!-- 未读标识 -->
          <div v-if="item.unread" class="unread-dot"></div>
        </div>

        <!-- 消息内容 -->
        <div class="message-card-content">
          <div class="message-card-header">
            <div class="message-title">{{ item.title }}</div>
            <div class="message-time">{{ item.time }}</div>
          </div>
          <div v-if="item.content" class="message-text">
            {{ item.content }}
          </div>
        </div>

        <!-- 官方消息的未读标识（右上角） -->
        <div v-if="messageType !== 'department' && item.unread" class="unread-dot"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import {
  getPersonalMessages,
  getDepartmentMessages,
  getSystemMessages,
  markMessageAsRead,
  type MessageItem,
  type SystemMessage
} from '../../api/message'

const router = useRouter()
const route = useRoute()

// 获取路由参数
const messageType = ref(route.query.type as string || 'system')
const messageTitle = ref(route.query.title as string || '消息详情')

// 消息列表
const messages = ref<(MessageItem | SystemMessage)[]>([])
const loading = ref(false)

// 加载消息列表
const loadMessages = async () => {
  try {
    loading.value = true
    
    let res
    if (messageType.value === 'personal') {
      res = await getPersonalMessages({ page: 1, page_size: 50 })
    } else if (messageType.value === 'department') {
      res = await getDepartmentMessages({ page: 1, page_size: 50 })
    } else {
      res = await getSystemMessages(1, 50)
    }
    
    if (res.code === 200) {
      messages.value = res.data.items
    } else {
      //ElMessage.error(res.message || '获取消息失败')
    }
  } catch (error) {
    console.error('获取消息失败:', error)
    //ElMessage.error('获取消息失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadMessages()
})

// 消息项列表（格式化）
const messageItems = computed(() => {
  return messages.value.map((msg: any) => ({
    id: msg.message_id,
    title: msg.title,
    content: msg.content,
    time: formatTime(msg.create_time),
    unread: !msg.is_read,
    target_type: msg.target_type,
    target_id: msg.target_id
  }))
})

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

// 获取标签文本
const getTagText = (item: any) => {
  if (item.target_type === 'question') {
    return '求助'
  }
  return '通知'
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 处理消息项点击
const handleItemClick = async (item: any) => {
  // 标记为已读
  try {
    await markMessageAsRead(item.id)
  } catch (error) {
    console.error('标记已读失败:', error)
  }
  
  // 根据消息类型跳转
  if (item.target_type === 'question' && item.target_id) {
    router.push({
      path: '/post/detail',
      query: {
        id: item.target_id
      }
    })
  } else if (item.target_type === 'answer' && item.target_id) {
    router.push({
      path: '/post/detail',
      query: {
        id: item.target_id
      }
    })
  }
}
</script>

<style scoped>
.message-detail-page {
  width: 100%;
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
  margin-right: 20px;
}

/* 消息列表 */
.message-list {
  padding: 12px 16px;
}

.message-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.message-card:active {
  transform: scale(0.98);
  background: #FAFAFA;
}

/* 顶部：标签和红点 */
.message-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.message-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  border: 1px solid;
}

.tag-help {
  background: rgba(0, 106, 255, 0.1);
  color: #006AFF;
  border-color: #006AFF;
}

.tag-suggest {
  background: rgba(46, 200, 79, 0.1);
  color: #2EC84F;
  border-color: #2EC84F;
}

.tag-warning {
  background: rgba(255, 98, 0, 0.1);
  color: #FF6200;
  border-color: #FF6200;
}

.message-card-content {
  position: relative;
}

.message-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
}

.message-title {
  flex: 1;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
  line-height: 1.4;
}

.message-time {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999999;
  flex-shrink: 0;
}

.message-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
}

/* 未读红点 */
.unread-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FF4D4F;
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
