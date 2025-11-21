<template>
  <el-dialog
    v-model="visible"
    title="内容详情"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="post-detail" v-if="postData" style="padding-top: 46px;">
      <!-- 帖子头部 -->
      <div class="post-header">
        <div class="author-info">
          <Avatar :src="postData.asker_avatar" :name="postData.asker_name" :size="36" />
          <div class="author-details">
            <div class="author-name">
              {{ postData.asker_name || '匿名用户' }}
            </div>
          </div>
        </div>
        <!-- <div class="post-tag" v-if="getCategoryName(postData.category)" :class="`tag-${getCategoryClass(postData.category)}`">
          {{ getCategoryName(postData.category) }}
        </div> -->
      </div>

      <!-- 精选标签和标题 -->
      <div class="title-section" :class="{ 'has-select': postData.is_featured === 1 }">
        <span class="post-title">{{ postData.title }}</span>
      </div>

      <!-- 帖子内容 -->
      <div class="post-content" v-if="postData.content">
        {{ postData.content }}
      </div>

      <!-- 帖子图片 -->
      <div class="post-images" v-if="postData.images && postData.images.length > 0">
        <img
          v-for="(image, index) in postData.images"
          :key="index"
          class="image-item"
          :class="`image-count-${postData.images.length}`"
          :src="image"
          alt="帖子图片"
        />
      </div>

      <!-- 话题标签 -->
      <div class="post-topics" v-if="postData.topics && postData.topics.length > 0">
        <div
          v-for="topic in postData.topics"
          :key="topic.topic_id"
          class="post-topic"
        >
          <span class="topic-icon">#</span>
          <span class="topic-text">{{ topic.title }}</span>
        </div>
      </div>

      <!-- @部门/人员 -->
      <div class="post-departments" v-if="(postData.related_depts && postData.related_depts.length > 0) || (postData.related_staffs && postData.related_staffs.length > 0)">
        <div class="section-title">@部门/人员</div>
        <div class="department-tags">
          <!-- 部门标签 -->
          <el-tag
            v-for="dept in postData.related_depts"
            :key="'dept_' + dept.dept_id"
            type="info"
            size="small"
          >
            {{ dept.dept_name }}
          </el-tag>
          <!-- 人员标签 -->
          <el-tag
            v-for="staff in postData.related_staffs"
            :key="'staff_' + staff.staff_code"
            type="warning"
            size="small"
          >
            {{ staff.is_virtual && staff.virtual_staff_name ? `${staff.name}（${staff.virtual_staff_name}）` : staff.name }}
          </el-tag>
        </div>
      </div>

      <!-- 帖子底部信息 -->
      <div class="post-footer">
        <div class="post-time">{{ formatTime(postData.create_time) }}</div>
        <div class="post-stats">
          <div class="stat-item">
            <el-icon><View /></el-icon>
            <span class="stat-text">{{ postData.view_count || 0 }} 浏览</span>
          </div>
          <div class="stat-item">
            <el-icon><ChatDotRound /></el-icon>
            <span class="stat-text">{{ postData.answer_count || 0 }} 回答</span>
          </div>
          <div class="stat-item">
            <el-icon><Star /></el-icon>
            <span class="stat-text">{{ postData.like_count || 0 }} 点赞</span>
          </div>
          <div class="stat-item">
            <el-icon><Collection /></el-icon>
            <span class="stat-text">{{ postData.favorite_count || 0 }} 收藏</span>
          </div>
        </div>
      </div>

      <!-- 状态信息 -->
      <div class="post-status-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="状态">
            <el-tag :type="postData.is_offline === 1 ? 'info' : 'warning'">
              {{ postData.is_offline === 1 ? '已下线' : '已上线' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="精选">
            <el-tag :type="postData.is_featured === 1 ? 'warning' : 'info'">
              {{ postData.is_featured === 1 ? '已精选' : '未精选' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="倒计时">
            {{ calculateCountdown(postData.days_remaining) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTime(postData.create_time) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button class="cancel-btn" @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { View, ChatDotRound, Star, Collection } from '@element-plus/icons-vue'
import Avatar from './Avatar.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
const postData = ref(null)

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal && props.data) {
    postData.value = props.data
  }
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 获取分类名称
// const getCategoryName = (category) => {
//   const categoryMap = {
//     '自由提问': '自由提问',
//     '求助类': '求助',
//     '建议类': '建议',
//     '吐槽类': '吐槽'
//   }
//   return categoryMap[category] || category || '推荐'
// }

// 获取分类样式类名
const getCategoryClass = (category) => {
  const classMap = {
    '自由提问': 'free',
    '求助类': 'help',
    '建议类': 'suggest',
    '吐槽类': 'complain'
  }
  return classMap[category] || 'free'
}

// 计算倒计时
const calculateCountdown = (deadline) => {
  if (!deadline) return '-'
  if (deadline < 0) return '已超时'
  return `${deadline}天`
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

// 关闭
const handleClose = () => {
  visible.value = false
  postData.value = null
}
</script>

<style scoped>
.post-detail {
  padding: 16px;
}

/* 帖子头部 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.post-tag {
  width: 50px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 12px 0 12px 0px;
  font-size: 13px;
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
  border: 1px solid;
}

.tag-suggest {
  background: rgba(46, 200, 79, 0.1);
  color: #2EC84F;
  border: 1px solid #2EC84F;
}

.tag-help {
  background: rgba(0, 106, 255, 0.1);
  color: #006AFF;
  border: 1px solid #006AFF;
}

.tag-complain {
  background: rgba(255, 60, 57, 0.1);
  color: #FF3C39;
  border: 1px solid #FF3C39;
}

.tag-free {
  background: rgba(255, 184, 0, 0.1);
  color: #FFB800;
  border: 1px solid #FFB800;
}

/* 精选标签和标题区域 */
.title-section {
  margin-bottom: 16px;
}

/* 帖子标题 */
.post-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 20px;
  color: #1A1A1A;
  line-height: 28px;
  display: block;
}

.title-section.has-select .post-title::before {
  content: '精选';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 8px;
  margin-right: 8px;
  background: #FFD700;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #1A1A1A;
}

/* 帖子内容 */
.post-content {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 16px;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
}

/* 帖子图片 */
.post-images {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.image-item {
  display: block;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
  max-width: 100%;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-item:hover {
  transform: scale(1.02);
}

.image-count-1 {
  width: 200px;
  height: 200px;
}

.image-count-2,
.image-count-3 {
  width: 150px;
  height: 150px;
}

/* 话题标签 */
.post-topics {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.post-topic {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #FFFFFF;
  border: 1px solid rgba(255, 221, 0, 0.3);
  border-radius: 16px;
  gap: 4px;
}

.topic-icon {
  font-size: 14px;
  font-weight: 600;
  color: #FFDD00;
}

.topic-text {
  font-size: 13px;
  font-weight: 400;
  color: #88662F;
}

/* 部门标签 */
.post-departments {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.department-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 帖子底部 */
.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.post-time {
  font-size: 13px;
  color: #999;
}

.post-stats {
  display: flex;
  gap: 24px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.stat-item .el-icon {
  color: #999;
  font-size: 16px;
}

.stat-text {
  font-size: 13px;
  color: #666;
}

/* 状态信息 */
.post-status-info {
  margin-top: 16px;
}

/* 按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  width: 120px;
  height: 44px;
  background: #FAFAFA;
  border: none;
  color: #4D4D4D;
  border-radius: 4px;
  font-size: 14px;
}

.cancel-btn:hover {
  background: #F0F0F0;
}
</style>

