<template>
  <div class="post-content">
    <!-- 用户信息 -->
    <div class="post-header">
      <div 
        class="author" 
        :class="{ 'not-clickable': isAnonymous }"
        @click="onAuthorClick"
      >
        <Avatar :src="author.forum_avatar" :name="author.name" :size="48" />
        <div class="author-info">
          <div class="author-name">{{ author.name }}</div>
          <div class="post-time">{{ time }}</div>
        </div>
      </div>
      <!-- 关注按钮 - 只在查看他人帖子时显示 -->
      <button v-if="showFollowBtn" class="follow-btn" :class="{ followed: isFollowed }" @click="onFollowClick">
        {{ isFollowed ? '已关注' : '关注' }}
      </button>
    </div>

    <!-- @提及 -->
    <div v-if="mentions && mentions.length > 0" class="mentions">
      <div v-for="mention in mentions" :key="mention" class="mention-tag">
        @{{ mention }}
      </div>
    </div>

    <!-- @部门和人员 (显示在标题上方) -->
    <div v-if="relatedMentions && relatedMentions.length > 0" class="related-mentions">
      <span v-for="(mention, index) in relatedMentions" :key="index" class="related-mention-item">
        @{{ mention }}<span v-if="index < relatedMentions.length - 1"> </span>
      </span>
    </div>

    <!-- 标题 -->
    <div class="post-title">{{ title }}</div>

    <!-- 内容 -->
    <div class="post-body">{{ content }}</div>

    <!-- 图片 -->
    <div v-if="images && images.length > 0" class="post-images">
      <img
        v-for="(image, index) in images"
        :key="index"
        :src="image"
        :alt="`图片${index + 1}`"
        class="post-image"
        :class="`image-count-${images.length}`"
        @click="handleImageClick(image)"
      />
    </div>

    <!-- 话题标签 -->
    <div v-if="topics && topics.length > 0" class="post-topics">
      <div v-for="(topic,index) in topics" :key="index" class="post-topic" @click="handleTopicClick(topic.topic_id)">
        <span class="topic-hash">#</span>
        <span class="topic-text">{{ topic.title }}</span>
      </div>
    </div>
    

    <!-- 解决状态按钮 (提问类型都显示，但只有自己的才能点击) -->
    <div v-if="showSolveStatus" class="solve-status-container">
      <div 
        ref="solveStatusBtn"
        class="solve-status" 
        :class="{ 
          'solve-solved': solved,
          'clickable': canChangeSolveStatus,
          'disabled': !canChangeSolveStatus
        }"
        @click="canChangeSolveStatus && onSolveClick()"
      >
        <span :class="['status-text', { solved: solved, disabled: !canChangeSolveStatus }]">
          {{ solved ? '已解决' : '未解决' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Avatar from '../common/Avatar.vue'
import type { Author, TopicInfo } from '../../types/post'
import { useImageViewerStore } from '../../stores/imageViewer'

defineOptions({
  name: 'PostContent'
})

const router = useRouter()
const imageViewerStore = useImageViewerStore()

// 解决状态按钮ref
const solveStatusBtn = ref<HTMLElement>()

interface Props {
  author: Author
  time: string
  mentions?: string[]
  relatedMentions?: string[]  // @的部门和人员
  title: string
  content: string
  images?: string[]  // 图片列表
  topic?: string
  topics?: TopicInfo[]  // 话题列表
  solved?: boolean
  showSolveStatus?: boolean  // 是否显示解决状态
  canChangeSolveStatus?: boolean  // 是否可以修改解决状态（只有自己的才能修改）
  showFollowBtn?: boolean  // 是否显示关注按钮（查看他人帖子时显示）
  isFollowed?: boolean  // 是否已关注
  isAnonymous?: boolean  // 是否匿名
}

interface Emits {
  (e: 'author-click'): void
  (e: 'solve-click'): void
  (e: 'follow-click'): void
}

const props = withDefaults(defineProps<Props>(), {
  solved: false,
  showSolveStatus: false,
  canChangeSolveStatus: false,
  showFollowBtn: false,
  isFollowed: false,
  isAnonymous: false
})

const emit = defineEmits<Emits>()

const onAuthorClick = () => {
  // 如果是匿名帖子，不触发点击事件
  if (props.isAnonymous) {
    return
  }
  emit('author-click')
}

const onSolveClick = () => {
  emit('solve-click')
}

const onFollowClick = () => {
  emit('follow-click')
}

// 处理图片点击
const handleImageClick = (imageUrl: string) => {
  imageViewerStore.open(imageUrl)
}

// 处理话题点击 - 跳转到话题详情页
const handleTopicClick = (topicId: number) => {
  router.push(`/topic/${topicId}`)
}

// 暴露给父组件使用
defineExpose({
  solveStatusBtn
})
</script>

<style scoped>
.post-content {
  padding: 16px;
  border-bottom: 8px solid #F5F5F5;
}

.post-header {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

/* 匿名用户不可点击 */
.author.not-clickable {
  cursor: default;
}

.author-info {
  flex: 1;
}

.author-name {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.post-time {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999;
}

/* @提及 */
.mentions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.mention-tag {
  display: flex;
  align-items: center;
  padding: 2px 8px;
  background: rgba(255, 221, 0, 0.1);
  border: 1px solid rgba(255, 221, 0, 0.5);
  border-radius: 12px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #FF9500;
  line-height: 1;
}

/* @部门和人员 (在标题上方) */
.related-mentions {
  margin-bottom: 8px;
  line-height: 22px;
}

.related-mention-item {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 16px;
  color: #FFBF00;
  text-align: left;
  font-style: normal;
  text-transform: none;
  height: 22px;
  line-height: 22px;
}

/* 标题 */
.post-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #1A1A1A;
  line-height: 1.4;
  margin-bottom: 12px;
}

/* 内容 */
.post-body {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
  line-height: 1.6;
  margin-bottom: 16px;
}

/* 图片 */
.post-images {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.post-image {
  display: block;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
  cursor: pointer;
  transition: transform 0.2s;
}

.post-image:active {
  transform: scale(0.98);
}

/* 单张图片：限高200px，最大宽度100%，自适应不拉伸 */
.post-image.image-count-1 {
  max-width: 100%;
  max-height: 200px;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* 多张图片：固定尺寸，裁剪显示 */
.post-image.image-count-2,
.post-image.image-count-3 {
  width: 108px;
  height: 108px;
  object-fit: cover;
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
  line-height: 1;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 8px;
}

.post-topic:hover {
  background: rgba(255, 221, 0, 0.1);
  border-color: rgba(255, 221, 0, 0.5);
}

.post-topic:active {
  transform: scale(0.95);
}

.topic-hash {
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
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #88662F;
  line-height: 1;
}

/* 关注按钮 */
.follow-btn {
  padding: 6px 16px;
  background: #FFDD00;
  border: none;
  border-radius: 16px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #1A1A1A;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.follow-btn.followed {
  background: #F5F5F5;
  color: #999;
}

.follow-btn:active {
  transform: scale(0.95);
}

.solve-status-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

/* 解决状态 */
.solve-status {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 12px;
  height: 28px;
  background: #FFF3F2;
  border-radius: 14px;
  transition: all 0.2s;
  margin-top: 8px;
}

.solve-solved{
  background: #ECF8ED;
}

.solve-status.clickable {
  cursor: pointer;
}

.solve-status.clickable:active {
  transform: scale(0.98);
}

/* 不可点击状态 - 灰色 */
.solve-status.disabled {
  background: #F5F5F5 !important;
  cursor: not-allowed;
}

.status-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #FF0D04;
  line-height: 1;
}

.status-text.solved {
  color: #1DAD13;
}

/* 不可点击状态的文字 - 灰色 */
.status-text.disabled {
  color: #999999 !important;
}
</style>

