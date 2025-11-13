<template>
  <div class="post-list">
    <PostCard
      v-for="post in posts"
      :key="post.id"
      :post="post"
      @click="handlePostClick"
    />
    <div v-if="posts.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
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
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}
</style>

