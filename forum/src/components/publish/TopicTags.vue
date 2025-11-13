<template>
  <div class="topic-tags-container" v-if="topics.length > 0">
    <div class="topic-tags-scroll">
      <div
        v-for="(topic, index) in topics"
        :key="index"
        class="topic-tag"
      >
        <span class="tag-icon">#</span>
        <span class="tag-text">{{ topic }}</span>
        <div class="tag-close" @click="$emit('remove', index)">
          <el-icon :size="12">
            <Close />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'

interface Props {
  topics: string[]
}

defineProps<Props>()
defineEmits<{
  remove: [index: number]
}>()
</script>

<style scoped>
.topic-tags-container {
  padding: 12px 16px;
  border-top: 1px solid #F5F5F5;
  overflow: hidden;
}

.topic-tags-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.topic-tags-scroll::-webkit-scrollbar {
  display: none;
}

.topic-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  background: #FFFFFF;
  border: 1px solid rgba(255, 221, 0, 0.3);
  border-radius: 16px;
  font-family: PingFang SC, PingFang SC;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1;
}

.tag-icon {
  color: #FFDD00;
  font-weight: 600;
  font-size: 14px;
  line-height: 1;
}

.tag-text {
  font-size: 12px;
  font-weight: 400;
  color: #88662F;
  line-height: 1;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-close {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #88662F;
  margin-left: 4px;
  padding: 0;
  line-height: 1;
}

.tag-close:active {
  color: #666;
}
</style>

