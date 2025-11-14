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

// 存储上一次的选中状态，用于检测部门的选中/取消
const previousSelectedDepartmentStaffIds = ref([])

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

// 递归查找部门（在原始数据中）
const findDepartmentInTree = (depts, deptId) => {
  for (const dept of depts) {
    if (dept.dept_id === deptId) return dept
    if (dept.children && dept.children.length > 0) {
      const found = findDepartmentInTree(dept.children, deptId)
      if (found) return found
    }
  }
  return null
}

// 收集部门下一级（仅当前部门）所有具有虚拟身份的人员ID（不包括子部门）
const collectVirtualStaffIds = (dept) => {
  const virtualStaffIds = []
  
  // 只收集当前部门的虚拟身份人员，不递归子部门
  if (dept.staffs && dept.staffs.length > 0) {
    dept.staffs.forEach(staff => {
      if (staff.is_virtual) {
        virtualStaffIds.push(`staff_${dept.dept_id}_${staff.staff_code}`)
      }
    })
  }
  
  return virtualStaffIds
}

// 监听选择的变化，自动处理虚拟身份人员
watch(selectedDepartmentStaffIds, (newIds, oldIds) => {
  if (!departmentTreeData.value.length) return
  
  const oldSet = new Set(oldIds || [])
  const newSet = new Set(newIds || [])
  
  // 找出新增的部门ID
  const addedDeptIds = []
  newIds.forEach(id => {
    if (!oldSet.has(id) && id.startsWith('dept_')) {
      addedDeptIds.push(parseInt(id.replace('dept_', '')))
    }
  })
  
  // 找出移除的部门ID
  const removedDeptIds = []
  oldIds.forEach(id => {
    if (!newSet.has(id) && id.startsWith('dept_')) {
      removedDeptIds.push(parseInt(id.replace('dept_', '')))
    }
  })
  
  let needUpdate = false
  const updatedIds = [...newIds]
  
  // 处理新增的部门：自动选中虚拟身份人员
  addedDeptIds.forEach(deptId => {
    const dept = findDepartmentInTree(departmentTreeData.value, deptId)
    if (dept) {
      const virtualStaffIds = collectVirtualStaffIds(dept)
      virtualStaffIds.forEach(staffId => {
        if (!updatedIds.includes(staffId)) {
          updatedIds.push(staffId)
          needUpdate = true
        }
      })
    }
  })
  
  // 处理移除的部门：取消选中虚拟身份人员
  removedDeptIds.forEach(deptId => {
    const dept = findDepartmentInTree(departmentTreeData.value, deptId)
    if (dept) {
      const virtualStaffIds = collectVirtualStaffIds(dept)
      virtualStaffIds.forEach(staffId => {
        const index = updatedIds.indexOf(staffId)
        if (index > -1) {
          updatedIds.splice(index, 1)
          needUpdate = true
        }
      })
    }
  })
  
  // 如果有变化，更新选择状态
  if (needUpdate) {
    // 使用 nextTick 避免死循环
    setTimeout(() => {
      selectedDepartmentStaffIds.value = updatedIds
    }, 0)
  }
}, { deep: true })

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
      const staffNodes = dept.staffs.map(staff => {
        // 如果是虚拟角色，在括号中显示虚拟角色名称
        const displayName = staff.is_virtual 
          ? `${staff.name}（${staff.virtual_staff_name}）` 
          : staff.name
        
        return {
          id: `staff_${dept.dept_id}_${staff.staff_code}`,
          name: displayName,
          type: 'staff',
          dept_id: dept.dept_id,
          staff_code: staff.staff_code,
          is_virtual: staff.is_virtual,
          virtual_staff_name: staff.virtual_staff_name
        }
      })
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
    const selectedIds = []
    
    // 初始化部门
    if (props.data.related_depts && props.data.related_depts.length > 0) {
      selectedIds.push(...props.data.related_depts.map(d => `dept_${d.dept_id}`))
    }
    
    // 初始化人员
    if (props.data.related_staffs && props.data.related_staffs.length > 0) {
      selectedIds.push(...props.data.related_staffs.map(s => {
        // 需要知道人员所属的部门ID，这里假设 related_staffs 包含 dept_id
        // 如果后端返回的数据结构不同，需要调整
        const deptId = s.dept_id || (props.data.related_depts && props.data.related_depts.length > 0 ? props.data.related_depts[0].dept_id : 0)
        return `staff_${deptId}_${s.staff_code}`
      }))
    }
    
    selectedDepartmentStaffIds.value = selectedIds

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

// 从选中的ID中提取部门ID和人员代码列表
const extractDepartmentStaffData = () => {
  const deptIds = new Set()
  const staffCodes = []
  
  selectedDepartmentStaffIds.value.forEach(id => {
    if (id.startsWith('dept_')) {
      // 部门节点
      const deptId = parseInt(id.replace('dept_', ''))
      deptIds.add(deptId)
    } else if (id.startsWith('staff_')) {
      // 人员节点，提取部门ID和员工代码
      const parts = id.split('_')
      if (parts.length >= 3) {
        const deptId = parseInt(parts[1])
        const staffCode = parts.slice(2).join('_') // 支持员工代码中可能包含下划线
        deptIds.add(deptId)
        staffCodes.push(staffCode)
      }
    }
  })
  
  return {
    dept_ids: Array.from(deptIds),
    staff_codes: staffCodes
  }
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
      const { dept_ids, staff_codes } = extractDepartmentStaffData()
      const result = {
        dept_ids: dept_ids,
        staff_codes: staff_codes,
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



