import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// 引入 REM 适配
import './utils/rem'

// 引入 Element Plus 和图标
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 条件引入 vconsole（仅在 URL 参数包含 istest=1 时）
const urlParams = new URLSearchParams(window.location.search)
if (urlParams.get('istest') === '1') {
  import('vconsole').then((module) => {
    new module.default()
  })
}

const app = createApp(App)
const pinia = createPinia()

// 注册 Element Plus
app.use(ElementPlus)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.mount('#app')
