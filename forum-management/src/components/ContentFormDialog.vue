<template>
  <el-dialog
    v-model="visible"
    title="编辑内容"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <!-- 选择部门/人员 -->
      <el-form-item label="@部门/人员" prop="departments">
        <el-tree-select
          v-model="selectedDepartmentStaffIds"
          :data="departmentTreeWithStaff"
          multiple
          filterable
          check-strictly
          show-checkbox
          :render-after-expand="false"
          placeholder="请选择部门/人员"
          style="width: 100%"
          :max-collapse-tags="3"
          collapse-tags
          collapse-tags-tooltip
          node-key="id"
          :props="{ 
            label: 'name', 
            children: 'children',
            value: 'id'
          }"
        />
      </el-form-item>

      <!-- 选择话题 - 使用下拉选择器 -->
      <el-form-item label="所属话题" prop="topics">
        <el-select
          v-model="selectedTopicIds"
          multiple
          filterable
          placeholder="请选择话题（最多3个）"
          style="width: 100%"
          :max-collapse-tags="3"
          @change="handleTopicChange"
        >
          <el-option
            v-for="topic in topicList"
            :key="topic.topic_id"
            :label="'#' + topic.title"
            :value="topic.topic_id"
          >
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>#{{ topic.title }}</span>
              <span style="font-size: 12px; color: #999;">{{ topic.question_count || 0 }}讨论</span>
            </div>
          </el-option>
        </el-select>
        <div class="hint-text">最多选择3个话题</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button class="cancel-btn" @click="handleCancel">取消</el-button>
        <el-button class="confirm-btn" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { getDepartmentTree } from '@/api/department'
import { getTopicsList } from '@/api/topics'

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
const formRef = ref(null)

// 表单数据
const formData = ref({
  departments: [],
  topics: []
})

// 部门人员选择相关
const departmentTreeData = ref([])
const selectedDepartmentStaffIds = ref([])

// 话题相关
const selectedTopicIds = ref([])
const topicList = ref([])

// 监听弹窗显示
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    initFormData()
    loadDepartments()
    loadTopics()
  }
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 将部门树数据转换为包含人员的树形结构
const transformDepartmentTree = (depts) => {
  return depts.map(dept => {
    const node = {
      id: `dept_${dept.dept_id}`,
      name: dept.dept_name,
      type: 'department',
      dept_id: dept.dept_id,
      children: []
    }
    
    // 添加人员节点
    if (dept.staffs && dept.staffs.length > 0) {
      const staffNodes = dept.staffs.map(staff => ({
        id: `staff_${dept.dept_id}_${staff.staff_code}`,
        name: staff.name,
        type: 'staff',
        dept_id: dept.dept_id,
        staff_code: staff.staff_code
      }))
      node.children.push(...staffNodes)
    }
    
    // 递归处理子部门
    if (dept.children && dept.children.length > 0) {
      const childDepts = transformDepartmentTree(dept.children)
      node.children.push(...childDepts)
    }
    
    return node
  })
}

// 计算包含人员的部门树
const departmentTreeWithStaff = computed(() => {
  return transformDepartmentTree(departmentTreeData.value)
})

// 初始化表单数据
const initFormData = () => {
  if (props.data) {
    // 初始化部门（只显示部门ID）
    if (props.data.related_depts && props.data.related_depts.length > 0) {
      selectedDepartmentStaffIds.value = props.data.related_depts.map(d => `dept_${d.dept_id}`)
    } else {
      selectedDepartmentStaffIds.value = []
    }

    // 初始化话题
    if (props.data.topics && props.data.topics.length > 0) {
      selectedTopicIds.value = props.data.topics.map(t => t.topic_id)
    } else {
      selectedTopicIds.value = []
    }
  }
}

// 加载部门树
const loadDepartments = async () => {
  try {
    const res = await getDepartmentTree({})
    if (res.data && res.data.departments) {
      departmentTreeData.value = res.data.departments
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

// 加载话题列表
const loadTopics = async () => {
  try {
    const res = await getTopicsList({ page: 1, page_size: 100 })
    if (res.data && res.data.items) {
      topicList.value = res.data.items
    }
  } catch (error) {
    console.error('获取话题列表失败:', error)
  }
}

// 从选中的ID中提取部门ID列表
const extractDepartmentIds = () => {
  const deptIds = new Set()
  
  selectedDepartmentStaffIds.value.forEach(id => {
    if (id.startsWith('dept_')) {
      // 部门节点
      const deptId = parseInt(id.replace('dept_', ''))
      deptIds.add(deptId)
    } else if (id.startsWith('staff_')) {
      // 人员节点，提取部门ID
      const parts = id.split('_')
      if (parts.length >= 2) {
        const deptId = parseInt(parts[1])
        deptIds.add(deptId)
      }
    }
  })
  
  return Array.from(deptIds)
}

// 处理话题选择变化
const handleTopicChange = (value) => {
  if (value.length > 3) {
    selectedTopicIds.value = value.slice(0, 3)
  }
}

// 表单验证规则
const formRules = {
  departments: [
    { 
      required: true, 
      message: '请至少选择一个部门/人员', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (selectedDepartmentStaffIds.value.length === 0) {
          callback(new Error('请至少选择一个部门/人员'))
        } else {
          callback()
        }
      }
    }
  ],
  topics: [
    { 
      required: true, 
      message: '请至少选择一个话题', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (selectedTopicIds.value.length === 0) {
          callback(new Error('请至少选择一个话题'))
        } else {
          callback()
        }
      }
    }
  ]
}

// 确认
const handleConfirm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      const result = {
        dept_ids: extractDepartmentIds(),
        topic_ids: selectedTopicIds.value
      }
      emit('confirm', result)
      visible.value = false
    }
  })
}

// 取消
const handleCancel = () => {
  visible.value = false
}

// 关闭时重置
const handleClose = () => {
  formRef.value?.resetFields()
  selectedDepartmentStaffIds.value = []
  selectedTopicIds.value = []
}
</script>

<style scoped>
.hint-text {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  width: 120px;
  height: 44px;
  background: #FAFAFA;
  border: none;
  color: #4D4D4D;
  border-radius: 4px;
  font-size: 14px;
}

.cancel-btn:hover {
  background: #F0F0F0;
}

.confirm-btn {
  width: 120px;
  height: 44px;
  background: #FF7800;
  border: none;
  color: #FFFFFF;
  border-radius: 4px;
  font-size: 14px;
}

.confirm-btn:hover {
  background: #FF8C1A;
}

.confirm-btn:active {
  background: #E66D00;
}
</style>



