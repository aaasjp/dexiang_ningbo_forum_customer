<template>
  <div class="category-section">
    <div class="section-label">问题类型</div>
    <div class="category-tabs">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="category-tab"
        :class="{ active: modelValue === cat.id }"
        @click="$emit('update:modelValue', cat.id)"
      >
        {{ cat.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string
  name: string
}

interface Props {
  modelValue: string
  categories: Category[]
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.white-block {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.section-label {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
  margin-bottom: 12px;
}

.category-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.category-tab {
  padding: 6px 12px;
  height: 32px;
  background: #F7F7F7;
  border: 1px solid transparent;
  border-radius: 16px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.category-tab.active {
  background: rgba(255, 221, 0, 0.1);
  color: #1A1A1A;
  font-weight: 500;
  border: 1px solid rgba(255, 221, 0, 0.5);
}

.category-tab:active {
  transform: scale(0.95);
}
</style>

