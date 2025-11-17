<template>
  <el-dialog
    :model-value="modelValue"
    width="640px"
    :show-close="false"
    :before-close="handleClose"
    class="user-tags-dialog"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">添加标签</span>
        <el-button class="add-new-btn" @click="addNewTag">
          <el-icon><Plus /></el-icon>
          添加标签
        </el-button>
      </div>
    </template>

    <div class="dialog-content">
      <div class="tags-list">
        <div class="header-row">
          <div class="col-sequence">序号</div>
          <div class="col-name">标签</div>
          <div class="col-action">操作</div>
        </div>
        <div 
          v-for="(tag, index) in tagsList" 
          :key="tag.tag_id || `new-${index}`"
          class="tag-row"
        >
          <div class="col-sequence">{{ index + 1 }}</div>
          <div class="col-name">
            <el-input
              v-model="tag.tag_name"
              placeholder="请输入标签名字"
              class="tag-input"
            />
          </div>
          <div class="col-action">
            <span class="delete-btn" @click="handleDelete(index)">删除</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button class="cancel-btn" @click="handleClose">取消</el-button>
        <el-button class="confirm-btn" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { getUserTagsList, batchUpdateUserTags } from '@/api/users'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const tagsList = ref([])
const loading = ref(false)
const originalTagsList = ref([]) // 保存原始数据用于取消时恢复和对比
const deletedTagIds = ref([]) // 记录删除的标签ID

// 获取标签列表
const fetchTagsList = async () => {
  try {
    loading.value = true
    const res = await getUserTagsList({})
    if (res.data && res.data.items) {
      tagsList.value = res.data.items.map(tag => ({
        tag_id: tag.tag_id,
        tag_name: tag.tag_name
      }))
      // 深拷贝保存原始数据
      originalTagsList.value = JSON.parse(JSON.stringify(tagsList.value))
      // 清空删除记录
      deletedTagIds.value = []
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

// 监听弹框打开
watch(() => props.modelValue, (val) => {
  if (val) {
    fetchTagsList()
  }
})

// 添加新标签
const addNewTag = () => {
  tagsList.value.push({
    tag_name: ''
    // 没有 tag_id，表示是新增
  })
}

// 删除标签
const handleDelete = (index) => {
  const tag = tagsList.value[index]
  // 如果有 tag_id，记录到删除列表
  if (tag.tag_id) {
    deletedTagIds.value.push(tag.tag_id)
  }
  tagsList.value.splice(index, 1)
}

// 确定
const handleConfirm = async () => {
  const changedTags = []
  
  // 1. 找出新增的标签（没有 tag_id 且有名称）
  const newTags = tagsList.value.filter(tag => !tag.tag_id && tag.tag_name && tag.tag_name.trim())
  newTags.forEach(tag => {
    changedTags.push({
      tag_id: null,
      tag_name: tag.tag_name.trim(),
      operation: 'create'
    })
  })
  
  // 2. 找出修改的标签（tag_id 存在且名称发生变化）
  tagsList.value.forEach(tag => {
    if (tag.tag_id && tag.tag_name && tag.tag_name.trim()) {
      const original = originalTagsList.value.find(o => o.tag_id === tag.tag_id)
      if (original && original.tag_name !== tag.tag_name.trim()) {
        changedTags.push({
          tag_id: tag.tag_id,
          tag_name: tag.tag_name.trim(),
          operation: 'update'
        })
      }
    }
  })
  
  // 3. 添加删除的标签
  deletedTagIds.value.forEach(tagId => {
    const original = originalTagsList.value.find(o => o.tag_id === tagId)
    changedTags.push({
      tag_id: tagId,
      tag_name: original ? original.tag_name : '',
      operation: 'delete'
    })
  })
  
  // 如果没有任何改动
  if (changedTags.length === 0) {
    ElMessage.info('没有任何改动')
    handleClose()
    return
  }
  
  // 验证至少保留一个标签
  const remainingCount = tagsList.value.filter(tag => tag.tag_name && tag.tag_name.trim()).length
  if (remainingCount === 0) {
    ElMessage.warning('请至少保留一个标签')
    return
  }
  
  try {
    await batchUpdateUserTags(changedTags)
    ElMessage.success('保存成功')
    emit('refresh')
    handleClose()
  } catch (error) {
    console.error('保存标签失败:', error)
    ElMessage.error('保存标签失败')
  }
}

// 关闭弹框
const handleClose = () => {
  // 恢复原始数据，清空当前修改状态
  tagsList.value = JSON.parse(JSON.stringify(originalTagsList.value))
  deletedTagIds.value = []
  emit('update:modelValue', false)
}

// 在组件外部添加一个用于打开并添加新行的方法
defineExpose({
  addNewTag
})
</script>

<style scoped>
.user-tags-dialog :deep(.el-dialog) {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.user-tags-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.dialog-title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.add-new-btn {
  height: 32px;
  padding: 0 12px;
  background: transparent;
  border: none;
  color: #FA8C16;
  font-size: 14px;
  cursor: pointer;
}

.add-new-btn:hover {
  background: #FFF7E6;
}

.add-new-btn :deep(.el-icon) {
  margin-right: 4px;
  font-weight: bold;
}

.user-tags-dialog :deep(.el-dialog__body) {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.user-tags-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.dialog-content {
  width: 100%;
}

.tags-list {
  width: 100%;
}

.header-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #F5F5F5;
  border-radius: 4px 4px 0 0;
  font-weight: 500;
  font-size: 14px;
  color: #666666;
}

.tag-row {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #F5F5F5;
}

.tag-row:last-child {
  border-bottom: none;
}

.col-sequence {
  width: 80px;
  text-align: center;
}

.col-name {
  flex: 1;
  padding: 0 16px;
}

.col-action {
  width: 120px;
  text-align: center;
}

.tag-input {
  width: 100%;
}

.tag-input :deep(.el-input__wrapper) {
  height: 40px;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
}

.delete-btn {
  color: #999999;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:hover {
  color: #FA8C16;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.cancel-btn {
  width: 120px;
  height: 44px;
  background: #F5F5F5;
  border: none;
  border-radius: 4px;
  color: #666666;
  font-size: 14px;
}

.cancel-btn:hover {
  background: #E8E8E8;
}

.confirm-btn {
  width: 120px;
  height: 44px;
  background: linear-gradient(90deg, #FFBD39 0%, #FF7800 100%);
  border: none;
  border-radius: 4px;
  color: #FFFFFF;
  font-size: 14px;
}

.confirm-btn:hover {
  opacity: 0.9;
}
</style>

