<template>
  <div class="post-list">
    <PostCard
      v-for="post in posts"
      :key="post.id"
      :post="post"
      @click="handlePostClick"
    />
    <div v-if="posts.length === 0" class="empty-state">
      <div class="empty-icon">
        <img src="../../assets/images/empty/follow_empty.png" alt="暂无数据" width="130" height="130" />
      </div>
      <div class="empty-text">暂无内容</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PostCard from './PostCard.vue'
import type { Post } from '../../types/post'

interface Props {
  posts: Post[]
}

interface Emits {
  (e: 'post-click', post: Post): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handlePostClick = (post: Post) => {
  emit('post-click', post)
}
</script>

<style scoped>
.post-list {
  background: #fff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
}

.empty-icon {
  margin-bottom: 30px;
  animation: float 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon img {
  display: block;
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
  line-height: 1.6;
}
</style>

