<template>
  <FormDialog
    v-model="visible"
    title="编辑"
    :form-data="formData"
    :rules="formRules"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <template #form="{ formData }">
      <el-form-item label="解决部门" prop="department">
        <el-input 
          v-model="formData.department" 
          placeholder="请输入解决部门"
        />
      </el-form-item>
      
      <el-form-item label="所属话题" prop="topic">
        <el-select 
          v-model="formData.topic" 
          placeholder="请选择所属话题"
          clearable
          filterable
        >
          <el-option label="技术交流" value="技术交流" />
          <el-option label="产品讨论" value="产品讨论" />
          <el-option label="运营推广" value="运营推广" />
          <el-option label="行业动态" value="行业动态" />
          <el-option label="银行知识" value="银行知识" />
          <el-option label="理财规划" value="理财规划" />
        </el-select>
      </el-form-item>
    </template>
  </FormDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import FormDialog from './FormDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formData = ref({
  department: '',
  topic: ''
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
  department: [
    { required: true, message: '请输入解决部门', trigger: 'blur' }
  ],
  topic: [
    { required: true, message: '请选择所属话题', trigger: 'change' }
  ]
}

const handleConfirm = (data) => {
  emit('confirm', data)
}

const handleCancel = () => {
  visible.value = false
}

const handleClose = () => {
  formData.value = {
    department: '',
    topic: ''
  }
}
</script>



