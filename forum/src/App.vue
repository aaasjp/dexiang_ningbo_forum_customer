<template>
  <div id="app">
    <Layout>
      <router-view />
    </Layout>
  </div>
</template>

<script setup lang="ts">
import Layout from './components/layout/Layout.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #e5e5e5;
}

#app {
  width: 100%;
  min-height: 100vh;
  max-width: 600px;
  margin: 0 auto;
  background: #f5f5f5;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
}
</style>
