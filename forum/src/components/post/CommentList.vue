<template>
  <div class="comments-section">
    <!-- 点击遮罩关闭菜单 -->
    <div v-if="showMoreMenuId" class="menu-overlay" @click="showMoreMenuId = null"></div>
    
    <div class="comments-header">
      <div class="comments-title">评论 ({{ comments.length }})</div>
    </div>

    <!-- 空状态 -->
    <div v-if="comments.length === 0" class="empty-comments">
      <img src="../../assets/images/detail/empty-comment.png" alt="暂无评论" class="empty-image">
      <div class="empty-text">暂无评论，发表您的第一个评论吧</div>
    </div>

    <!-- 评论列表 -->
    <div v-else class="comments-list">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="comment-item"
      >
        <Avatar :src="comment.forum_avatar" :name="comment.author" :size="40" />
        <div class="comment-content">
          <div class="comment-header">
            <div class="author-info">
              <span class="comment-author">{{ comment.author }}</span>
              <span v-if="comment.is_useful === 1" class="useful-badge">有用</span>
            </div>
            <div class="action-item more-btn" @click.stop="toggleMoreMenu(comment.id)">
              <img src="../../assets/images/icon/more.png" alt="更多" class="action-image" width="16" height="16"/>
            </div>
          </div>
          
          <!-- 更多菜单 -->
          <div v-if="showMoreMenuId === comment.id" class="comment-more-menu">
            <!-- 帖子作者看到的选项 -->
            <div v-if="isOwnPost" class="menu-item" @click="handleUseful(comment)">
              {{ comment.is_useful ? '取消采纳' : '采纳' }}
            </div>
            
            <!-- 回答作者看到的选项 -->
            <!-- <div v-if="isOwnComment(comment)" class="menu-item" @click="handleEdit(comment)">修改</div> -->
            <div v-if="isOwnComment(comment)" class="menu-item" @click="handleDelete(comment)">删除</div>
          </div>
          
          <div class="comment-text">{{ comment.content }}</div>
          
          <!-- 评论图片 -->
          <div v-if="comment.images && comment.images.length > 0" class="comment-images">
            <img
              v-for="(image, index) in comment.images"
              :key="index"
              :src="image"
              alt="评论图片"
              class="comment-image"
              @click="handleImageClick(image)"
            />
          </div>
          
          <div class="comment-footer">
            <span class="comment-time">回复于 {{ comment.time }}</span>
            <div class="comment-actions">
              <div class="action-item" @click="onReply(comment)">
                <img src="../../assets/images/detail/answer.png" alt="回复" class="action-image" width="16" height="16"/>
                <!-- <span>回复</span> -->
              </div>
              <div 
                class="action-item" 
                :class="{ liked: comment.liked }"
                @click="onLike(comment)"
              >
                <img v-if="!comment.liked" src="../../assets/images/detail/support.png" alt="点赞" class="action-image" width="16" height="16"/>
                <img v-if="comment.liked" src="../../assets/images/icon/like-active.png" alt="点赞" class="action-image" width="16" height="16"/>
                <span>{{ comment.likes ? comment.likes : '点赞' }}</span>
              </div>
            </div>
          </div>
          
          <!-- 子回复列表（扁平化展示所有层级） -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
            <div
              v-for="reply in flattenReplies(comment.replies)"
              :key="reply.id"
              class="reply-item"
            >
              <Avatar :src="reply.forum_avatar" :name="reply.author" :size="18" />
              <div class="reply-content">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.author }}</span>
                  <span class="reply-arrow">▶</span>
                  <span class="reply-to">{{ reply.replyTo }}</span>
                </div>
                <div class="reply-text">{{ reply.content }}</div>
                
                <!-- 回复图片 -->
                <div v-if="reply.images && reply.images.length > 0" class="reply-images">
                  <img
                    v-for="(image, index) in reply.images"
                    :key="index"
                    :src="image"
                    alt="回复图片"
                    class="reply-image"
                    @click="handleImageClick(image)"
                  />
                </div>
                
                <div class="reply-footer">
                  <span class="reply-time">回复于 {{ reply.time }}</span>
                  <div class="reply-actions">
                    <div class="action-item" @click="onReplyToReply(reply, comment)">
                      <img src="../../assets/images/detail/answer.png" alt="回复" class="action-image" width="16" height="16"/>
                      <!-- <span>回复</span> -->
                    </div>
                    <div 
                      class="action-item" 
                      :class="{ liked: reply.liked }"
                      @click="onLikeReply(reply, comment)"
                    >
                      <img v-if="!reply.liked" src="../../assets/images/detail/support.png" alt="点赞" class="action-image" width="16" height="16"/>
                      <img v-if="reply.liked" src="../../assets/images/icon/like-active.png" alt="点赞" class="action-image" width="16" height="16"/>
                      <span>{{ reply.likes ? reply.likes : '点赞' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Avatar from '../common/Avatar.vue'
import type { Comment, CommentReply } from '../../types/post'
import { useImageViewerStore } from '../../stores/imageViewer'

defineOptions({
  name: 'CommentList'
})

const imageViewerStore = useImageViewerStore()

interface Props {
  comments: Comment[]
  isOwnPost?: boolean  // 是否是自己的帖子
  currentUserCode?: string  // 当前用户工号
}

interface Emits {
  (e: 'reply', comment: Comment): void
  (e: 'like', comment: Comment): void
  (e: 'more', comment: Comment): void
  (e: 'reply-to-reply', reply: CommentReply, comment: Comment): void
  (e: 'like-reply', reply: CommentReply, comment: Comment): void
  (e: 'useful', comment: Comment): void
  (e: 'edit', comment: Comment): void
  (e: 'delete', comment: Comment): void
}

const props = withDefaults(defineProps<Props>(), {
  isOwnPost: false,
  currentUserCode: ''
})
const emit = defineEmits<Emits>()

const showMoreMenuId = ref<string | null>(null)

const toggleMoreMenu = (commentId: string) => {
  if (showMoreMenuId.value === commentId) {
    showMoreMenuId.value = null
  } else {
    showMoreMenuId.value = commentId
  }
}

// 判断是否是自己的评论
const isOwnComment = (comment: Comment) => {
  return props.currentUserCode && comment.answerer_code === props.currentUserCode
}

const onReply = (comment: Comment) => {
  emit('reply', comment)
}

const onLike = (comment: Comment) => {
  emit('like', comment)
}

const handleUseful = (comment: Comment) => {
  showMoreMenuId.value = null
  emit('useful', comment)
}

// const handleEdit = (comment: Comment) => {
//   showMoreMenuId.value = null
//   emit('edit', comment)
// }

const handleDelete = (comment: Comment) => {
  showMoreMenuId.value = null
  emit('delete', comment)
}

const onReplyToReply = (reply: CommentReply, comment: Comment) => {
  emit('reply-to-reply', reply, comment)
}

const onLikeReply = (reply: CommentReply, comment: Comment) => {
  emit('like-reply', reply, comment)
}

// 扁平化回复列表（递归将所有层级的回复转换为一维数组）
const flattenReplies = (replies: CommentReply[]): CommentReply[] => {
  const result: CommentReply[] = []
  
  const flatten = (replyList: CommentReply[]) => {
    replyList.forEach(reply => {
      // 添加当前回复
      result.push(reply)
      // 如果有子回复，递归处理
      if (reply.replies && reply.replies.length > 0) {
        flatten(reply.replies)
      }
    })
  }
  
  flatten(replies)
  return result
}

// 处理图片点击
const handleImageClick = (imageUrl: string) => {
  imageViewerStore.open(imageUrl)
}
</script>

<style scoped>
.comments-section {
  padding: 16px;
  position: relative;
}

/* 菜单遮罩 */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  z-index: 100;
  cursor: default;
  pointer-events: auto;
}

.comments-header {
  margin-bottom: 16px;
}

.comments-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 16px;
  color: #1A1A1A;
}

/* 空状态 */
.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.empty-image {
  display: block;
  width: 130px;
  height: 130px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #999;
  text-align: center;
  margin-top: 16px;
  line-height: 1.6;
}

/* 评论列表 */
.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #F5F5F5;
  position: relative;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  position: relative;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.comment-author {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #1A1A1A;
}

.useful-badge {
  padding: 2px 8px;
  background: linear-gradient(135deg, #FFDD00 0%, #FFB800 100%);
  border-radius: 10px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 12px;
  color: #1A1A1A;
  white-space: nowrap;
}

.comment-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
  line-height: 1.6;
  margin-bottom: 8px;
}

/* 评论图片 */
.comment-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.comment-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;  /* 保持宽高比，裁剪多余部分，不拉伸 */
  cursor: pointer;
  transition: transform 0.2s;
  background: #f0f0f0;
}

.comment-image:active {
  transform: scale(0.95);
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.comment-time {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999;
}

.comment-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #999;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  transition: color 0.2s;
  padding: 4px 8px;
  margin: -4px -8px;
  position: relative;
}

.action-item:active {
  color: #666;
}

.action-item.liked {
  color: #FFDD00;
}

.action-item.more-btn {
  padding: 4px;
  cursor: pointer;
}

.comment-header .action-item.more-btn {
  margin-left: 8px;
}

/* 评论更多菜单 */
.comment-more-menu {
  position: absolute;
  right: 30px;
  top: 24px;
  background: #4A4A4A;
  border-radius: 8px;
  overflow: hidden;
  z-index: 101;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.comment-more-menu .menu-item {
  width: 80px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
}

.comment-more-menu .menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 子回复列表 */
.replies-list {
  margin-top: 12px;
  /* padding-left: 12px; */
  /* border-left: 2px solid #F5F5F5; */
}

.reply-item {
  display: flex;
  gap: 8px;
  padding: 12px 0;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
}

.reply-author {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 13px;
  color: #1A1A1A;
}

.reply-arrow {
  font-size: 10px;
  color: #999;
}

.reply-to {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 13px;
  color: #666;
}

.reply-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #1A1A1A;
  line-height: 1.6;
  margin-bottom: 6px;
}

/* 回复图片 */
.reply-images {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.reply-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;  /* 保持宽高比，裁剪多余部分，不拉伸 */
  cursor: pointer;
  transition: transform 0.2s;
  background: #f0f0f0;
}

.reply-image:active {
  transform: scale(0.95);
}

.reply-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.reply-time {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 11px;
  color: #999;
}

.reply-actions {
  display: flex;
  gap: 12px;
}
</style>

