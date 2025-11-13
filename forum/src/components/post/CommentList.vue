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
        <div class="comment-avatar">{{ comment.avatar }}</div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author }}</span>
            <div class="action-item more-btn" @click.stop="toggleMoreMenu(comment.id)">
              <img src="../../assets/images/icon/more.png" alt="更多" class="action-image" width="16" height="16"/>
            </div>
          </div>
          
          <!-- 更多菜单 -->
          <div v-if="showMoreMenuId === comment.id" class="comment-more-menu">
            <div class="menu-item" @click="handleShare(comment)">分享</div>
            <div class="menu-item" @click="handleReport(comment)">举报</div>
          </div>
          
          <div class="comment-text">{{ comment.content }}</div>
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
          
          <!-- 子回复列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
            <div
              v-for="reply in comment.replies"
              :key="reply.id"
              class="reply-item"
            >
              <div class="reply-avatar">{{ reply.avatar }}</div>
              <div class="reply-content">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.author }}</span>
                  <span class="reply-arrow">▶</span>
                  <span class="reply-to">{{ reply.replyTo }}</span>
                </div>
                <div class="reply-text">{{ reply.content }}</div>
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
import type { Comment, CommentReply } from '../../types/post'

defineOptions({
  name: 'CommentList'
})

interface Props {
  comments: Comment[]
}

interface Emits {
  (e: 'reply', comment: Comment): void
  (e: 'like', comment: Comment): void
  (e: 'more', comment: Comment): void
  (e: 'reply-to-reply', reply: CommentReply, comment: Comment): void
  (e: 'like-reply', reply: CommentReply, comment: Comment): void
  (e: 'share', comment: Comment): void
  (e: 'report', comment: Comment): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const showMoreMenuId = ref<string | null>(null)

const toggleMoreMenu = (commentId: string) => {
  if (showMoreMenuId.value === commentId) {
    showMoreMenuId.value = null
  } else {
    showMoreMenuId.value = commentId
  }
}

const onReply = (comment: Comment) => {
  emit('reply', comment)
}

const onLike = (comment: Comment) => {
  emit('like', comment)
}

const handleShare = (comment: Comment) => {
  showMoreMenuId.value = null
  emit('share', comment)
}

const handleReport = (comment: Comment) => {
  showMoreMenuId.value = null
  emit('report', comment)
}

const onReplyToReply = (reply: CommentReply, comment: Comment) => {
  emit('reply-to-reply', reply, comment)
}

const onLikeReply = (reply: CommentReply, comment: Comment) => {
  emit('like-reply', reply, comment)
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
  z-index: 100;
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
}

.empty-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #999;
  text-align: center;
  margin-top: 16px;
}

/* 评论列表 */
.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #F5F5F5;
  position: relative;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #F7F7F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
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

.comment-author {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #1A1A1A;
  flex: 1;
}

.comment-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.reply-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #F7F7F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
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

.reply-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

