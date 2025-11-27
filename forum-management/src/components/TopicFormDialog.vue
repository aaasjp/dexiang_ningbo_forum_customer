<template>
  <FormDialog
    v-model="visible"
    :title="title"
    :form-data="formData"
    :rules="formRules"
    width="680px"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
    label-position="top"
  >
    <template #form="{ formData }">
      <el-form-item label="封面图片" prop="coverImage" class="vertical-form-item" label-position="top">
        <div class="upload-container">
          <el-upload
            class="cover-uploader"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            action="#"
            accept="image/png,image/jpg,image/jpeg"
          >
            <div v-if="formData.coverImage" class="cover-preview">
              <img :src="formData.coverImage" alt="封面图片" />
            </div>
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
            </div>
          </el-upload>
          <div class="upload-tips-container">
              <div class="upload-tips">
              图片≤<i>5MB</i>，格式为<i>png/jpg</i>
            </div>
          </div>
          
        </div>
      </el-form-item>
      
      <el-form-item label="话题名称" prop="topicName" class="vertical-form-item" label-position="top">
        <el-input 
          v-model="formData.topicName" 
          placeholder="请输入话题名称"
          clearable
          maxlength="50"
        />
      </el-form-item>
      
      <el-form-item label="话题描述" prop="description" class="vertical-form-item" label-position="top">
        <el-input 
          v-model="formData.description" 
          type="textarea"
          placeholder="请输入话题描述"
          :rows="4"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </template>
  </FormDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import FormDialog from './FormDialog.vue'
import { ElMessage } from 'element-plus'
import { uploadImage } from '@/api/topics'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '创建新话题'
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formData = ref({
  coverImage: '',
  topicName: '',
  description: ''
})

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal && props.data) {
    formData.value = { ...props.data }
  }
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

const formRules = {
  topicName: [
    { required: true, message: '请输入话题名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入话题描述', trigger: 'blur' }
  ]
}

const beforeUpload = async (file) => {
  const isImage = ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传 PNG/JPG 格式的图片！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！')
    return false
  }
  
  try {
    // 显示预览
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.coverImage = e.target.result
    }
    reader.readAsDataURL(file)
    
    // 上传图片到服务器
    const response = await uploadImage(file)
    if (response.code === 200 && response.data.image_url) {
      // 保存服务器返回的图片URL
      formData.value.coverImage = response.data.image_url
      ElMessage.success('图片上传成功')
    } else {
      throw new Error('上传失败')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败，请重试')
    // 清除预览
    formData.value.coverImage = ''
    return false
  }
  
  return false // 阻止自动上传
}

const handleUploadSuccess = () => {
  //ElMessage.success('上传成功')
}

const handleConfirm = (data) => {
  emit('confirm', data)
}

const handleCancel = () => {
  visible.value = false
}

const handleClose = () => {
  formData.value = {
    coverImage: '',
    topicName: '',
    description: ''
  }
}
</script>

<style scoped>
/* 垂直布局的表单项 */
.vertical-form-item :deep(.el-form-item__label) {
  display: block;
  text-align: left;
  margin-bottom: 8px;
  line-height: 22px;
}

.vertical-form-item :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

/* 图片上传容器 - 横向布局 */
.upload-container {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.cover-uploader {
  flex-shrink: 0;
}

.upload-placeholder {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-placeholder:hover {
  border-color: #fa8c16;
}

.upload-icon {
  font-size: 32px;
  color: #bfbfbf;
}

.cover-preview {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.upload-tips-container{
  display: flex;
  align-items: flex-end;
height: 120px;
}
.upload-tips {
  font-size: 12px;
  color: #999999;
  line-height: 22px;
  padding-top: 2px;
  
}
.upload-tips i{
    color: #1A1A1A;
    font-style: normal;
  }
</style>



