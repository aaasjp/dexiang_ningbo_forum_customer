import { onActivated, nextTick } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

/**
 * 保持页面滚动位置的 Hook
 * 配合 keep-alive 使用
 */
export function useScrollKeepAlive() {
  let scrollTop = 0

  onBeforeRouteLeave(() => {
    // 保存当前滚动位置
    scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop
    console.log('💾 保存滚动位置:', scrollTop)
  })

  onActivated(() => {
    // 组件被激活时恢复滚动位置
    console.log('📍 准备恢复滚动位置:', scrollTop)
    
    if (scrollTop > 0) {
      // 使用 nextTick 确保 DOM 已更新
      nextTick(() => {
        // 使用 requestAnimationFrame 确保在浏览器下一帧渲染时执行
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollTop)
          console.log('✅ 滚动位置已恢复:', scrollTop, '当前位置:', window.scrollY)
        })
      })
    }
  })
}

