<template>
  <div class="avatar-edit-page">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-left" @click="handleCancel">
        <el-icon :size="24">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="nav-title">设置头像</div>
      <div class="nav-right" @click="showActionSheet">
        <el-icon :size="24">
          <More />
        </el-icon>
      </div>
    </div>

    <!-- 头像预览区 -->
    <div class="avatar-preview-container">
      <div class="avatar-preview">
        <img 
          v-if="avatarUrl" 
          :src="avatarUrl" 
          alt="头像" 
          class="avatar-image"
          :style="{ 
            width: placeholderSize + 'px', 
            height: placeholderSize + 'px',
            transform: `rotate(${rotation}deg)` 
          }"
        />
        <div 
          v-else 
          class="avatar-placeholder" 
          :style="{ width: placeholderSize + 'px', height: placeholderSize + 'px' }"
          @click="showActionSheet"
        >
          <span class="placeholder-text">{{ userNameLastTwo }}</span>
        </div>
      </div>
    </div>
    
    <!-- 圆形孔洞蒙层 -->
    <div class="circular-mask">
      <svg width="100%" height="100%" :viewBox="`0 0 ${maskWidth} ${maskHeight}`" preserveAspectRatio="none">
        <defs>
          <mask id="circleMask">
            <rect width="100%" height="100%" fill="white"/>
            <circle :cx="circleCenterX" :cy="circleCenterY" :r="circleRadius" fill="black"/>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.7)" mask="url(#circleMask)"/>
        <circle :cx="circleCenterX" :cy="circleCenterY" :r="circleRadius" fill="none" stroke="white" stroke-width="3"/>
      </svg>
    </div>

    <!-- 底部操作按钮 -->
    <div class="bottom-actions">
      <div class="action-button cancel-btn" @click="handleCancel">
        取消
      </div>
      <div class="action-button rotate-btn" @click="handleRotate">
        <img src="../../assets/images/icon/rotate.png" alt="旋转" class="rotate-icon" />
      </div>
      <div class="action-button confirm-btn" @click="handleConfirm">
        确定
      </div>
    </div>

    <!-- 底部操作弹窗 -->
    <div v-if="showSheet" class="action-sheet-overlay" @click.self="showSheet = false">
      <div class="action-sheet">
        <div class="action-btn" @click="takePhoto">拍照</div>
        <div class="action-btn" @click="selectFromAlbum">从手机相册中选择</div>
        <div class="action-btn-line"></div>
        <div class="action-btn cancel" @click="showSheet = false">取消</div>
      </div>
    </div>

    <!-- 隐藏的文件选择器 -->
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      style="display: none" 
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElLoading } from 'element-plus'
import { ArrowLeft, More } from '@element-plus/icons-vue'
import { getUserProfile, updateUserProfile } from '../../api/user'
import { uploadImage } from '../../api/upload'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

// 头像数据
const avatarUrl = ref('')
const originalAvatarUrl = ref('')
const showSheet = ref(false)
const fileInput = ref<HTMLInputElement>()
const rotation = ref(0)
const selectedFile = ref<File | null>(null)

// 用户名后两位
const userNameLastTwo = computed(() => {
  const name = userStore.userProfile?.nickname || userStore.userProfile?.name || '用户'
  return name.slice(-2)
})

// 蒙层尺寸
const maskWidth = ref(375)
const maskHeight = ref(812)
const circleRadius = computed(() => {
  // PC端限制圆形区域大小
  const isPC = window.innerWidth > 768
  if (isPC) {
    return 150 // PC端固定半径150px
  }
  return maskWidth.value / 2 // 移动端为屏幕宽度的一半
})

// 圆心位置
const circleCenterX = computed(() => maskWidth.value / 2)
const circleCenterY = computed(() => {
  const navHeight = 44
  const isPC = window.innerWidth > 768
  // 圆心位置：考虑导航栏，图片实际显示在 44px 下方区域的中心
  // 图片中心 = 44 + (视口高度 - 44) / 2
  // PC端需要额外偏移15px
  const baseY = navHeight + (maskHeight.value - navHeight) / 2
  return isPC ? baseY + 15 : baseY
})

// 占位符大小（等于圆的直径）
const placeholderSize = computed(() => circleRadius.value * 2)

// 加载当前头像
const loadAvatar = async () => {
  try {
    const res = await getUserProfile()
    if (res.data?.forum_avatar) {
      avatarUrl.value = res.data.forum_avatar
      originalAvatarUrl.value = res.data.forum_avatar
    }
  } catch (error) {
    console.error('加载头像失败:', error)
  }
}

// 显示操作菜单
const showActionSheet = () => {
  showSheet.value = true
}

// 旋转图片
const handleRotate = () => {
  rotation.value = (rotation.value + 90) % 360
}

// 取消操作
const handleCancel = () => {
  if (selectedFile.value) {
    // 如果有选择的文件，返回原始头像
    avatarUrl.value = originalAvatarUrl.value
    selectedFile.value = null
    rotation.value = 0
  } else {
    // 如果没有选择文件，返回上一页
    router.back()
  }
}

// 确定保存
const handleConfirm = async () => {
  if (!selectedFile.value) {
    router.back()
    return
  }
  
  try {
    const loading = ElLoading.service({
      lock: true,
      text: '正在上传...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    // 如果有旋转，需要先旋转图片
    let fileToUpload = selectedFile.value
    if (rotation.value !== 0) {
      fileToUpload = await rotateImage(selectedFile.value, rotation.value)
    }
    
    // 上传图片
    const uploadRes = await uploadImage(fileToUpload)
    
    if (uploadRes.data?.image_url) {
      // 更新用户资料
      await updateUserProfile({ forum_avatar: uploadRes.data.image_url })
      loading.close()
      //ElMessage.success('头像更新成功')
      
      // 返回上一页
      router.back()
    } else {
      loading.close()
      //ElMessage.error('上传失败，未获取到图片地址')
    }
  } catch (error: any) {
    //ElMessage.error(error.message || '上传失败')
  }
}

// 拍照
const takePhoto = () => {
  showSheet.value = false
  // 在移动端，可以通过 capture 属性直接调用摄像头
  if (fileInput.value) {
    fileInput.value.setAttribute('capture', 'camera')
    fileInput.value.click()
  }
}

// 从相册选择
const selectFromAlbum = () => {
  showSheet.value = false
  if (fileInput.value) {
    fileInput.value.removeAttribute('capture')
    fileInput.value.click()
  }
}

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    //ElMessage.error('请选择图片文件')
    target.value = ''
    return
  }
  
  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    //ElMessage.error('图片大小不能超过5MB')
    target.value = ''
    return
  }
  
  // 保存选择的文件
  selectedFile.value = file
  rotation.value = 0
  
  // 创建预览 URL
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  
  // 清空 input，以便可以重复选择同一文件
  target.value = ''
}

// 旋转图片
const rotateImage = (file: File, degrees: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('无法获取canvas context'))
          return
        }
        
        // 设置canvas尺寸
        if (degrees === 90 || degrees === 270) {
          canvas.width = img.height
          canvas.height = img.width
        } else {
          canvas.width = img.width
          canvas.height = img.height
        }
        
        // 旋转图片
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((degrees * Math.PI) / 180)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)
        
        // 转换为blob
        canvas.toBlob((blob) => {
          if (blob) {
            const rotatedFile = new File([blob], file.name, { type: file.type })
            resolve(rotatedFile)
          } else {
            reject(new Error('转换图片失败'))
          }
        }, file.type)
      }
      img.onerror = () => reject(new Error('加载图片失败'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

// 更新蒙层尺寸
const updateMaskSize = () => {
  // 蒙层始终覆盖整个viewport
  maskWidth.value = window.innerWidth
  maskHeight.value = window.innerHeight
}

// 页面加载时获取当前头像
onMounted(() => {
  loadAvatar()
  updateMaskSize()
  window.addEventListener('resize', updateMaskSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMaskSize)
})
</script>

<style scoped>
.avatar-edit-page {
  width: 100%;
  background: #000;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.nav-left,
.nav-right {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
  color: #FFFFFF;
}

.nav-left:active,
.nav-right:active {
  opacity: 0.6;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 17px;
  color: #FFFFFF;
}

/* 头像预览区 */
.avatar-preview-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: visible;
}

.avatar-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: transparent;
  transform: translateY(22px);
}

.avatar-image {
  object-fit: cover;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.placeholder-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 80px;
  color: #FFFFFF;
  user-select: none;
}

/* PC端调整占位符文字大小 */
@media (min-width: 768px) {
  .placeholder-text {
    font-size: 60px;
  }
}

/* 圆形孔洞蒙层 */
.circular-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 10;
}

.circular-mask svg {
  width: 100%;
  height: 100%;
}

/* 底部操作按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  background: transparent;
  z-index: 100;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 16px;
  transition: opacity 0.2s;
}

.action-button:active {
  opacity: 0.7;
}

.cancel-btn {
  color: #FFFFFF;
  background: transparent;
  padding: 8px 16px;
}

.rotate-btn {
  width: 56px;
  height: 56px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 0;
}

.rotate-icon {
  width: 28px;
  height: 28px;
}

.confirm-btn {
  min-width: 88px;
  height: 40px;
  background: #FFD100;
  border-radius: 20px;
  color: #000000;
  padding: 0 24px;
  font-weight: 500;
}

/* 底部操作弹窗 */
.action-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.action-sheet {
  background: #fff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  
  /* padding: 0 16px 16px; */
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.action-btn {
  width: 100%;
  height: 50px;
  background: #fff;
  border: none;
  border-bottom: 1px solid #F5F5F5;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 16px;
  color: #1A1A1A;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:first-child {
  margin-top: 8px;
  border-radius: 12px 12px 0 0;
}

.action-btn:last-child {
  border-bottom: none;
}

.action-btn:not(.cancel):last-child {
  border-radius: 0 0 12px 12px;
}

.action-btn:active {
  background: #F5F5F5;
}

.action-btn.cancel {
  background: #fff;
  color: #666;
  margin-top: 8px;
  border-radius: 12px;
  border: none;
}
.action-btn-line {
  width: 100%;
  height: 16px;
  background: #FAFAFA;
}
</style>
