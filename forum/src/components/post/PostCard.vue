<template>
  <div class="post-card" @click="handleClick">
    <!-- 帖子头部 -->
    <div class="post-header">
      <div 
        class="author-info" 
        :class="{ 'not-clickable': post.is_anonymous === 1 }"
        @click.stop="handleAuthorClick"
      >
        <Avatar :src="post.author.avatar" :name="post.author.name" :size="24" />
        <div class="author-details">
          <div class="author-name">
            {{ post.author.name }}
            <!-- <span v-if="post.author.badge" class="badge">{{ post.author.badge }}</span> -->
          </div>
        </div>
      </div>
      <div class="post-tag" :class="`tag-${post.category}`" v-if="getCategoryName(post.category)">
        {{ getCategoryName(post.category) }}
      </div>
    </div>

    <!-- 精选标签和标题 -->
    <div class="title-section">
      <span class="post-title">
        <span v-if="post.is_featured === 1" class="select-badge">精选</span>
        {{ post.title }}
      </span>
    </div>

    <!-- 帖子内容预览 -->
    <div class="post-content" v-if="post.content">
      {{ post.content }}
    </div>

    <!-- 帖子图片 -->
    <div class="post-images" v-if="post.images && post.images.length > 0">
      <img
        v-for="(image, index) in post.images"
        :key="index"
        class="image-item"
        :class="`image-count-${post.images.length}`"
        :src="image" alt="帖子图片"
        @click.stop="handleImageClick(image)"
      />
    </div>

    <!-- 话题标签 -->
    <div class="post-topics-wrapper" v-if="post.topics && post.topics.length > 0">
      <div 
        class="post-topic" 
        v-for="topic in post.topics" 
        :key="topic.topic_id"
        @click.stop="handleTopicClick(topic.topic_id)"
      >
        <span class="topic-icon">#</span>
        <span class="topic-text">{{ topic.title }}</span>
      </div>
    </div>

    <!-- 帖子底部 -->
    <div class="post-footer">
      <span class="post-time">{{ post.time }}</span>
      <div class="post-stats">
        <div class="stat-item" :class="{ active: post.commented }">
          <img src="../../assets/images/icon/answer.png" alt="评论" class="action-image" width="16" height="16"/>
          <span class="stat-text">{{ post.comments > 0 ? formatNumber(post.comments) : '评论' }}</span>
        </div>
        <div class="stat-item" :class="{ active: post.liked }" @click.stop="handleLike">
          <img v-if="!post.liked" src="../../assets/images/icon/like.png" alt="点赞" class="action-image" width="16" height="16"/>
          <img v-if="post.liked" src="../../assets/images/icon/like-active.png" alt="点赞" class="action-image" width="16" height="16"/>
          <span class="stat-text">{{ post.likes > 0 ? formatNumber(post.likes) : '点赞' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Avatar from '../common/Avatar.vue'
import type { Post } from '../../types/post'
import { useUserStore } from '../../stores/user'
import { useImageViewerStore } from '../../stores/imageViewer'

interface Props {
  post: Post
}

interface Emits {
  (e: 'click', post: Post): void
  (e: 'like', post: Post): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()
const userStore = useUserStore()
const imageViewerStore = useImageViewerStore()

// 当前用户的工号 - 从 store 中获取
const currentUserStaffCode = computed(() => userStore.userProfile?.staff_code || '')

// 处理点赞
const handleLike = () => {
  emit('like', props.post)
}

// 处理图片点击
const handleImageClick = (imageUrl: string) => {
  imageViewerStore.open(imageUrl)
}

// 获取分类名称
const getCategoryName = (category: string) => {
  const categoryMap: Record<string, string> = {
    suggest: '建议',
    help: '求助',
    complain: '吐槽',
    free: '' // 自由不展示
  }
  return categoryMap[category] || ''
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num === 0) return ''
  if (num < 1000) return num.toString()
  if (num < 10000) return (num / 1000).toFixed(1).replace('.0', '') + 'K'
  return (num / 10000).toFixed(1).replace('.0', '') + 'k'
}

// 处理点击
const handleClick = () => {
  emit('click', props.post)
}

// 处理作者点击 - 跳转到个人主页
const handleAuthorClick = () => {
  // 如果是匿名帖子，不允许点击
  if (props.post.is_anonymous === 1) {
    return
  }
  
  // 使用 staff_code 或 asker_code 跳转到个人主页
  const staffCode = props.post.author.staff_code || props.post.asker_code
  if (!staffCode) {
    return
  }
  
  // 如果点击的是自己，跳转到个人中心页
  if (staffCode === currentUserStaffCode.value) {
    router.push('/profile')
  } else {
    // 否则跳转到他人主页
    router.push(`/profile/home/${staffCode}`)
  }
}

// 处理话题点击 - 跳转到话题详情页
const handleTopicClick = (topicId: number) => {
  if (topicId) {
    router.push(`/topic/${topicId}`)
  }
}
</script>

<style scoped>
.post-card {
  padding: 16px;  /* 4vw → 16px */
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
  background: #fff;
}

.post-card:active {
  background: #fafafa;
}

/* 帖子头部 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;  /* 3vw → 12px */
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;  /* 2.5vw → 10px */
  flex: 1;
  min-width: 0;
  cursor: pointer;
  transition: opacity 0.2s;
}

.author-info:hover {
  opacity: 0.8;
}

.author-info:active {
  opacity: 0.6;
}

/* 匿名用户不可点击 */
.author-info.not-clickable {
  cursor: default;
}

.author-info.not-clickable:hover {
  opacity: 1;
}

.author-info.not-clickable:active {
  opacity: 1;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 14px;  /* clamp(12px, 3.7vw, 14px) → 14px */
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;  /* 1.5vw → 6px */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  padding: 2px 8px;  /* 0.5vw 2vw → 2px 8px */
  font-size: 10px;
  font-weight: 400;
  white-space: nowrap;
  flex-shrink: 0;
  height: 20px;
  color: #A56D39;
  text-align: left;
  font-style: normal;
  text-transform: none;
  font-family: PingFang SC, PingFang SC;
  
  /* 背景渐变 */
  background: linear-gradient(133deg, #FDF3EA 0%, #F5E9DE 100%);
  
  /* 边框渐变 - 使用伪元素实现圆角 */
  position: relative;
  border: 1px solid #DEB691;
  border-radius: 10px 0 10px 0;  /* 左上 右上 右下 左下 */
  background-clip: padding-box;
}

.badge::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(180deg, #F7D6B7 0%, #DEB691 100%);
  border-radius: 10px 0 10px 0;
  z-index: -1;
}

.post-tag {
  width: 40px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 12px 0 12px 0px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
  border: 1px solid;
  position: relative;
  background-clip: padding-box;
}

.tag-suggest {
  /* background: linear-gradient(180deg, #2EC84F 0%, #65DD1B 100%); */
  background: rgba(46, 200, 79, 0.1);
  color: #2EC84F; 
  border: 1px solid #2EC84F;
  /* border-image: linear-gradient(228deg, rgba(46, 200, 79, 1), rgba(101, 221, 27, 1)) 1 1; */
}

.tag-help {
  /* background: linear-gradient( 180deg, #006AFF 0%, #00AEFF 100%); */
  background: rgba(0, 106, 255, 0.1);
  color: #006AFF;
  border: 1px solid #006AFF;
  /* border-image: linear-gradient(228deg, rgba(0, 106, 255, 1), rgba(0, 174, 255, 1)) 1 1; */
}

.tag-complain {
  /* background: linear-gradient(180deg, #FF3C39 0%, #FF6200 100%); */
  background: rgba(255, 60, 57, 0.1);
  color: #FF3C39;
  border: 1px solid #FF3C39;
  /* border-image: linear-gradient(228deg, rgba(255, 60, 57, 1), rgba(255, 98, 0, 1)) 1 1; */
}

.tag-select {
  background: #FFF9C4;
  color: #F57F17;
}

/* 精选标签和标题区域 */
.title-section {
  margin-bottom: 8px;
}

/* 帖子标题 */
.post-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.post-title .select-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 18px;
  padding: 0 4px;
  background: #FFDD00;
  border-radius: 5px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 11px;
  color: #000000;
  line-height: 18px;
  text-align: center;
  white-space: nowrap;
  margin-right: 4px;
}

/* 帖子内容 */
.post-content {
  font-size: 14px;  /* clamp(13px, 3.7vw, 14px) → 14px */
  line-height: 1.6;
  color: #666;
  margin-bottom: 10px;  /* 2.5vw → 10px */
  word-wrap: break-word;
  word-break: break-word;
}

/* 帖子图片 */
.post-images {
  display: flex;
  gap: 6px;  /* 2vw → 8px */
  margin-bottom: 10px;  /* 2.5vw → 10px */
  flex-wrap: wrap;
}

.image-item {
  display: block;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
  max-width: 100%;
  width: 108px;
  height: 108px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-item:active {
  transform: scale(0.95);
}


/* 话题标签容器 */
.post-topics-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

/* 话题标签 */
.post-topic {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: #FFFFFF;
  border: 1px solid rgba(255, 221, 0, 0.3);
  border-radius: 16px;
  gap: 2px;
  vertical-align: middle;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.post-topic:hover {
  background: rgba(255, 221, 0, 0.1);
  border-color: rgba(255, 221, 0, 0.5);
}

.post-topic:active {
  transform: scale(0.95);
}

.topic-icon {
  font-size: 14px;
  font-weight: 600;
  background: #FFDD00;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1A1A1A;
  line-height: 1;
}

.topic-text {
  font-size: 12px;
  font-weight: 400;
  color: #88662F;
  line-height: 1;
}

/* 帖子底部 */
.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-item .el-icon {
  color: #999;
  transition: color 0.3s;
}

.stat-item.active .el-icon {
  color: #FFB800;
}

.stat-item.active .stat-text {
  color: #FFB800;
}

.stat-text {
  font-size: 12px;
  color: #999;
  transition: color 0.3s;
}
</style>

