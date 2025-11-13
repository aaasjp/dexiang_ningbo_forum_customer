<template>
  <div class="mention-section white-block" @click="$emit('open-modal')">
    <img src="../../assets/images/icon/at.png" alt="提及" class="action-icon" />
    <div class="mention-content">
      <div v-if="mentionedUsers.length === 0" class="mention-placeholder">
        @部门/人员
      </div>
      <div v-else class="mention-list-wrapper">
        <div class="mention-list">
          <span v-for="user in mentionedUsers" :key="user" class="mention-tag">
            @{{ user }}
          </span>
        </div>
        <div class="mention-arrow">
          <el-icon :size="16">
            <ArrowRight />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'

interface Props {
  mentionedUsers: string[]
}

defineProps<Props>()
defineEmits<{
  'open-modal': []
}>()
</script>

<style scoped>
.white-block {
  background: #fff;
  /* border-radius: 8px; */
  padding: 16px;
}

.mention-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.action-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.mention-content {
  flex: 1;
  min-width: 0;
}

.mention-placeholder {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #CCCCCC;
}

.mention-list-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.mention-list {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  position: relative;
  justify-content: flex-start;
}

.mention-list::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  pointer-events: none;
}

.mention-tag {
  padding: 2px 6px;
  /* background: #F7F7F7; */
  border-radius: 12px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 15px;
  color: #666;
  white-space: nowrap;
  flex-shrink: 0;
}

.mention-arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  /* background: rgba(0, 0, 0, 0.05); */
  border-radius: 50%;
  color: #999;
}
</style>

