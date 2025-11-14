<template>
  <div class="layout">
    <div class="content" :class="{ 'with-tabbar': showTabBar }">
      <slot></slot>
    </div>
    <TabBar v-if="showTabBar" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './TabBar.vue'

const route = useRoute()

const showTabBar = computed(() => {
  return route.meta.showTabBar === true
})
</script>

<style scoped>
.layout {
  width: 100%;
  background: #ffffff;
}

.content {
  width: 100%;
}

.content.with-tabbar {
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
}
</style>

