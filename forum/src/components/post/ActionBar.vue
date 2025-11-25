<template>
  <div class="action-bar">
    <CommentInput 
      v-model="commentText"
      :show-submit-btn="false"
      @focus="onInputFocus"
      @submit="onCommentSubmit"
    />
    
    <div class="action-buttons">
      <!-- <div class="action-btn" @click="onAnswer">
        <img src="../../assets/images/detail/answer.png" alt="回答" class="action-image">
        <span>回答</span>
      </div> -->
      <div class="action-btn" :class="{ active: liked }" @click="onLike">
        <img src="../../assets/images/detail/support.png" alt="点赞" v-if="!liked" class="action-image">
        <img src="../../assets/images/icon/like-active.png" alt="点赞" v-else class="action-image">
        <span>{{ formatCount(likes) }}</span>
      </div>
      <div class="action-btn" :class="{ active: collected }" @click="onCollect">
        <img src="../../assets/images/detail/collect.png" alt="收藏" v-if="!collected" class="action-image">
        <img src="../../assets/images/icon/collect-active.png" alt="收藏" v-else class="action-image">
        <span>{{ formatCount(collects) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CommentInput from './CommentInput.vue'

defineOptions({
  name: 'ActionBar'
})

interface Props {
  likes: number
  collects: number
  liked?: boolean
  collected?: boolean
}

interface Emits {
  (e: 'answer'): void
  (e: 'like'): void
  (e: 'collect'): void
  (e: 'input-focus'): void
  (e: 'comment-submit', text: string): void
}

withDefaults(defineProps<Props>(), {
  liked: false,
  collected: false
})

const emit = defineEmits<Emits>()

const commentText = ref('')

const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1).replace('.0', '') + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1).replace('.0', '') + 'k'
  }
  return count.toString()
}

const onLike = () => {
  emit('like')
}

const onCollect = () => {
  emit('collect')
}

const onInputFocus = () => {
  emit('input-focus')
}

const onCommentSubmit = (text: string) => {
  emit('comment-submit', text)
}
</script>

<style scoped>
.action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  background: #fff;
  padding: 8px 16px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  border-top: 1px solid #F5F5F5;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.action-btn.active {
  color: #FFDD00;
}

.action-image {
  width: 24px;
  height: 24px;
}

.action-btn span {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 11px;
  margin-top: 2px;
}
</style>

