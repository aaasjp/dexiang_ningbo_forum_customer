/**
 * REM 适配工具
 * 设计稿基准：375px
 * 根字体大小：37.5px (375 / 10)
 * 使用方式：设计稿上的 100px = 100 / 37.5 = 2.67rem
 */

// 设计稿宽度
const DESIGN_WIDTH = 375

// 根字体大小基准（设计稿宽度 / 10）
const BASE_FONT_SIZE = DESIGN_WIDTH / 10

// 设置根字体大小
function setRemUnit() {
  const docEl = document.documentElement
  const clientWidth = docEl.clientWidth
  
  if (!clientWidth) return
  
  // 限制最小和最大宽度 (PC端适配：最大600px)
  const minWidth = 320
  const maxWidth = 600
  const width = Math.min(Math.max(clientWidth, minWidth), maxWidth)
  
  // 计算根字体大小
  const fontSize = (width / DESIGN_WIDTH) * BASE_FONT_SIZE
  
  // 设置根字体大小
  docEl.style.fontSize = fontSize + 'px'
}

// 初始化
setRemUnit()

// 监听窗口大小变化
window.addEventListener('resize', setRemUnit)

// 监听页面显示（处理横竖屏切换）
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    setRemUnit()
  }
})

// 监听屏幕方向变化
if ('onorientationchange' in window) {
  window.addEventListener('orientationchange', () => {
    setTimeout(setRemUnit, 300)
  })
}

/**
 * px 转 rem 的辅助函数
 * @param px 设计稿上的像素值
 * @returns rem 值
 */
export function pxToRem(px: number): string {
  return `${px / BASE_FONT_SIZE}rem`
}

/**
 * 批量转换 px 到 rem
 * @param pxValues px 值数组
 * @returns rem 值数组
 */
export function pxToRemBatch(...pxValues: number[]): string[] {
  return pxValues.map(px => pxToRem(px))
}

export default {
  pxToRem,
  pxToRemBatch
}

