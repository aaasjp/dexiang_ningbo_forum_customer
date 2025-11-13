<template>
  <div class="avatar-edit-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="header-title">头像</div>
      <div class="upload-btn" @click="showActionSheet">
        <el-icon :size="20">
          <MoreFilled />
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
        />
        <div v-else class="avatar-placeholder"></div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'
import { getUserProfile, updateUserProfile } from '../../api/user'
import { uploadImage } from '../../api/upload'

const router = useRouter()

// 头像数据
const avatarUrl = ref('')
const showSheet = ref(false)
const fileInput = ref<HTMLInputElement>()

// 加载当前头像
const loadAvatar = async () => {
  try {
    const res = await getUserProfile()
    if (res.data?.forum_avatar) {
      avatarUrl.value = res.data.forum_avatar
    }
  } catch (error) {
    console.error('加载头像失败:', error)
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 显示操作菜单
const showActionSheet = () => {
  showSheet.value = true
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
    ElMessage.error('请选择图片文件')
    target.value = ''
    return
  }
  
  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    target.value = ''
    return
  }
  
  // 创建预览 URL
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  
  // 上传图片并更新资料
  try {
    const loading = ElLoading.service({
      lock: true,
      text: '正在上传...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    // 上传图片
    const uploadRes = await uploadImage(file)
    
    if (uploadRes.data?.image_url) {
      // 自动调用更新接口
      await updateUserProfile({ forum_avatar: uploadRes.data.image_url })
      loading.close()
      ElMessage.success('头像更新成功')
      
      // 更新显示的头像URL为服务器返回的URL
      avatarUrl.value = uploadRes.data.image_url
    } else {
      loading.close()
      ElMessage.error('上传失败，未获取到图片地址')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败')
  }
  
  // 清空 input，以便可以重复选择同一文件
  target.value = ''
}

// 页面加载时获取当前头像
onMounted(() => {
  loadAvatar()
})
</script>

<style scoped>
.avatar-edit-page {
  width: 100%;
  
  min-height: 100vh;
  background: #000;
  overflow-x: hidden;
}

/* 顶部导航 */
.header {
  background: #000;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn,
.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
}

.header-title {
  flex: 1;
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #fff;
  text-align: center;
}

/* 头像预览区 */
.avatar-preview-container {
  width: 100%;
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.avatar-preview {
  width: 100vw;
  height: 100vw;
  max-width: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #000;
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
  margin-top: 16px;
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
