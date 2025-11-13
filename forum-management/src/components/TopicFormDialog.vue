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
  >
    <template #form="{ formData }">
      <el-form-item label="封面图片" prop="coverImage">
        <div class="upload-area">
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
          <div class="upload-tips">
            图片≤5MB，格式为png/jpg
          </div>
        </div>
      </el-form-item>
      
      <el-form-item label="话题名称" prop="topicName">
        <el-select 
          v-model="formData.topicName" 
          placeholder="请选择部门"
          clearable
          filterable
        >
          <el-option label="技术交流" value="技术交流" />
          <el-option label="产品讨论" value="产品讨论" />
          <el-option label="运营推广" value="运营推广" />
          <el-option label="行业动态" value="行业动态" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="话题描述" prop="description">
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
    { required: true, message: '请选择话题名称', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入话题描述', trigger: 'blur' }
  ]
}

const beforeUpload = (file) => {
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
  
  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.coverImage = e.target.result
  }
  reader.readAsDataURL(file)
  
  return false // 阻止自动上传
}

const handleUploadSuccess = () => {
  ElMessage.success('上传成功')
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
.upload-area {
  width: 100%;
}

.cover-uploader {
  width: 100%;
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

.upload-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #999999;
}
</style>



