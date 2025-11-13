<template>
  <div class="message-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="header-title">消息</div>
    </div>

    <!-- 消息列表 -->
    <div class="content">
      <!-- 官方消息 -->
      <div
        class="message-item"
        @click="goToSystemMessages"
      >
        <div class="avatar">📢</div>
        <div class="message-info">
          <div class="message-header">
            <span class="username">官方消息</span>
            <span class="time" v-if="officialMessage">{{ officialMessage.time }}</span>
          </div>
          <p class="message-content">
            {{ officialMessage ? officialMessage.content : '暂无系统消息' }}
          </p>
        </div>
        <div class="unread-dot" v-if="officialMessage && officialMessage.unread"></div>
      </div>

      <!-- 部门消息 -->
      <div
        class="message-item"
        @click="goToDepartmentMessages"
      >
        <div class="avatar">🏢</div>
        <div class="message-info">
          <div class="message-header">
            <span class="username">部门消息</span>
            <span class="time" v-if="departmentMessage">{{ departmentMessage.time }}</span>
          </div>
          <p class="message-content">
            {{ departmentMessage ? departmentMessage.content : '暂无部门消息' }}
          </p>
        </div>
        <div class="unread-dot" v-if="departmentMessage && departmentMessage.unread"></div>
      </div>

      <!-- 灰色间隔 -->
      <div class="message-divider"></div>

      <!-- 其他消息 -->
      <div
        class="message-item"
        v-for="message in otherMessages"
        :key="message.id"
        @click="handleMessageClick(message)"
      >
        <!-- 头像：根据消息类型显示 -->
        <div 
          v-if="message.avatarUrl" 
          class="avatar avatar-image"
          :style="{ backgroundImage: `url(${message.avatarUrl})` }"
        ></div>
        <div v-else class="avatar">{{ message.avatar }}</div>
        
        <div class="message-info">
          <div class="message-header">
            <span class="username">{{ message.displayName }}</span>
            <span class="time">{{ message.time }}</span>
          </div>
          <p class="message-content">{{ message.content }}</p>
        </div>
        <div class="unread-dot" v-if="message.unread"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  getPersonalMessages, 
  getDepartmentMessages, 
  getSystemMessages,
  markMessageAsRead,
  markSystemMessagesAsRead,
  type MessageItem,
  type SystemMessage
} from '../../api/message'

const router = useRouter()

// 消息数据
const personalMessages = ref<MessageItem[]>([])
const departmentMessages = ref<MessageItem[]>([])
const systemMessages = ref<SystemMessage[]>([])
const loading = ref(false)

// 加载所有消息
const loadMessages = async () => {
  try {
    loading.value = true
    
    // 并行加载三种类型的消息
    const [personalRes, deptRes, systemRes] = await Promise.all([
      getPersonalMessages({ page: 1, page_size: 20 }),
      getDepartmentMessages({ page: 1, page_size: 20 }),
      getSystemMessages(1, 20)
    ])
    
    if (personalRes.code === 200) {
      personalMessages.value = personalRes.data.items
    }
    
    if (deptRes.code === 200) {
      departmentMessages.value = deptRes.data.items
    }
    
    if (systemRes.code === 200) {
      systemMessages.value = systemRes.data.items
    }
  } catch (error) {
    console.error('获取消息失败:', error)
    ElMessage.error('获取消息失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadMessages()
})

// 系统消息（取最近一条）
const officialMessage = computed(() => {
  if (systemMessages.value.length > 0) {
    const msg = systemMessages.value[0]
    return {
      id: msg.message_id,
      type: 'system',
      avatar: '📢',
      title: '系统消息',
      content: msg.content, // 使用 content 字段
      time: formatTime(msg.create_time),
      unread: !msg.is_read
    }
  }
  return null
})

// 部门消息（取最近一条）
const departmentMessage = computed(() => {
  if (departmentMessages.value.length > 0) {
    const msg = departmentMessages.value[0]
    return {
      id: msg.message_id,
      type: 'department',
      avatar: '🏢',
      title: '部门消息',
      content: msg.content, // 使用 content 字段
      time: formatTime(msg.create_time),
      unread: !msg.is_read
    }
  }
  return null
})

// 其他个人消息
const otherMessages = computed(() => {
  return personalMessages.value.map(msg => {
    const isInteractionType = ['question', 'answer', 'comment'].includes(msg.target_type || '')
    
    return {
      id: msg.message_id,
      type: 'personal',
      target_type: msg.target_type,
      target_id: msg.target_id,
      // 如果是 question/answer/comment 类型，使用 target_image，否则使用默认头像
      avatarUrl: isInteractionType ? msg.target_image : null,
      avatar: '👤', // 默认头像（当没有 avatarUrl 时使用）
      // 如果是 question/answer/comment 类型，使用 target_name，否则使用 title
      displayName: isInteractionType ? (msg.target_name || msg.title) : msg.title,
      title: msg.title,
      content: msg.content,
      time: formatTime(msg.create_time),
      unread: !msg.is_read
    }
  })
})

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  
  // 小于24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  
  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }
  
  // 显示日期
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

// 跳转到系统消息详情
const goToSystemMessages = async () => {
  // 标记系统消息为已读
  try {
    await markSystemMessagesAsRead()
    // 标记成功后，更新本地状态，移除红点
    systemMessages.value.forEach(msg => {
      msg.is_read = true
    })
  } catch (error) {
    console.error('标记系统消息已读失败:', error)
  }
  
  router.push({
    path: `/message/detail`,
    query: {
      type: 'system',
      title: '系统消息'
    }
  })
}

// 跳转到部门消息详情
const goToDepartmentMessages = async () => {
  // 标记部门消息为已读（如果有第一条消息）
  if (departmentMessages.value.length > 0) {
    const firstMsg = departmentMessages.value[0]
    try {
      await markMessageAsRead(firstMsg.message_id)
      // 标记成功后，更新本地状态，移除红点
      firstMsg.is_read = true
    } catch (error) {
      console.error('标记部门消息已读失败:', error)
    }
  }
  
  router.push({
    path: `/message/detail`,
    query: {
      type: 'department',
      title: '部门消息'
    }
  })
}

// 处理消息点击
const handleMessageClick = async (message: any) => {
  // 标记消息为已读
  try {
    await markMessageAsRead(message.id)
    // 标记成功后，更新本地状态，移除红点
    const msgInList = personalMessages.value.find(m => m.message_id === message.id)
    if (msgInList) {
      msgInList.is_read = true
    }
  } catch (error) {
    console.error('标记消息已读失败:', error)
    // 标记失败时不跳转
    return
  }
  
  // 根据消息类型进行跳转
  const targetType = message.target_type
  const targetId = message.target_id
  
  // question、answer、comment 类型跳转到对应的帖子详情
  if (['question', 'answer', 'comment'].includes(targetType) && targetId) {
    router.push(`/post/detail?id=${targetId}`)
  } else if (targetType === 'points') {
    // points 类型保持现有逻辑，不跳转或跳转到积分页面
    // 这里可以根据需求决定是否跳转
    console.log('积分消息，不进行跳转')
  }
  // 其他类型不做跳转
}
</script>

<style scoped>
.message-page {
  width: 100%;
  
  min-height: 100vh;
  background: #fff;
  overflow-x: hidden;
}

/* 顶部导航 */
.header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #F5F5F5;
}

.header-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #1A1A1A;
  text-align: center;
}

/* 消息列表 */
.content {
  padding: 0;
}

.message-item {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 16px;
  border-bottom: 1px solid #F5F5F5;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}

.message-item:active {
  background: #FAFAFA;
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #F7F7F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 12px;
  flex-shrink: 0;
}

.avatar-image {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.message-info {
  flex: 1;
  min-width: 0;
  padding-right: 12px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.username {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
}

.time {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999999;
  flex-shrink: 0;
  margin-left: 8px;
}

.message-content {
  margin: 0;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #666666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FF4D4F;
  flex-shrink: 0;
}

/* 灰色间隔 */
.message-divider {
  height: 8px;
  background: #F5F5F5;
  margin: 0;
}
</style>
