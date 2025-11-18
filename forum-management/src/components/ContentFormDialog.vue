<template>
  <FormDialog
    v-model="visible"
    title="编辑"
    :form-data="formData"
    :rules="formRules"
    width="600px"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <template #form="{ formData }">
      <!-- 选择部门/人员 -->
      <el-form-item label="解决部门" prop="departments" label-position="top">
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
      <el-form-item label="所属话题" prop="topics" label-position="top">
        <el-select
          v-model="selectedTopicIds"
          multiple
          filterable
          placeholder="请选择话题（最多5个）"
          style="width: 100%"
          :max-collapse-tags="5"
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
        <div class="hint-text">最多选择5个话题</div>
      </el-form-item>

      <!-- 问题类型 -->
      <el-form-item label="问题类型" prop="category" label-position="top">
        <el-select
          v-model="formData.category"
          placeholder="请选择问题类型"
          style="width: 100%"
        >
          <el-option
            v-for="type in questionTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>
    </template>
  </FormDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { getDepartmentTree } from '@/api/department'
import { getTopicsList } from '@/api/topics'
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

// 表单数据
const formData = ref({
  departments: [],
  topics: [],
  category: ''
})

// 部门人员选择相关
const departmentTreeData = ref([])
const selectedDepartmentStaffIds = ref([])

// 话题相关
const selectedTopicIds = ref([])
const topicList = ref([])

// 问题类型选项
const questionTypes = [
  { label: '随便说说', value: '随便说说' },
  { label: '求助类', value: '求助类' },
  { label: '建议类', value: '建议类' },
  { label: '吐槽类', value: '吐槽类' }
]

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

// 在部门树中递归查找员工所属的部门ID
const findStaffDeptId = (depts, staffCode) => {
  for (const dept of depts) {
    // 在当前部门的员工中查找
    if (dept.staffs && dept.staffs.length > 0) {
      const staff = dept.staffs.find(s => s.staff_code === staffCode)
      if (staff) {
        return dept.dept_id
      }
    }
    // 递归查找子部门
    if (dept.children && dept.children.length > 0) {
      const deptId = findStaffDeptId(dept.children, staffCode)
      if (deptId) {
        return deptId
      }
    }
  }
  return null
}

// 初始化表单数据
const initFormData = () => {
  if (props.data) {
    const selectedIds = []
    
    // 初始化部门 - 使用 related_dept_ids
    if (props.data.related_dept_ids && props.data.related_dept_ids.length > 0) {
      selectedIds.push(...props.data.related_dept_ids.map(deptId => `dept_${deptId}`))
    }
    
    // 初始化人员 - 使用 related_staff_codes，需要在部门树中查找对应的部门ID
    if (props.data.related_staff_codes && props.data.related_staff_codes.length > 0) {
      // 等待部门树加载完成后再处理人员回填
      // 这部分逻辑会在 watch departmentTreeData 中处理
    }
    
    selectedDepartmentStaffIds.value = selectedIds

    // 初始化话题
    if (props.data.topics && props.data.topics.length > 0) {
      selectedTopicIds.value = props.data.topics.map(t => t.topic_id)
    } else {
      selectedTopicIds.value = []
    }

    // 初始化问题类型
    formData.value.category = props.data.category || ''
  }
}

// 加载部门树
const loadDepartments = async () => {
  try {
    const res = await getDepartmentTree({})
    if (res.data && res.data.departments) {
      departmentTreeData.value = res.data.departments
      // 部门树加载完成后，处理人员回填
      if (props.data && props.data.related_staff_codes && props.data.related_staff_codes.length > 0) {
        const staffIds = []
        props.data.related_staff_codes.forEach(staffCode => {
          const deptId = findStaffDeptId(departmentTreeData.value, staffCode)
          if (deptId) {
            staffIds.push(`staff_${deptId}_${staffCode}`)
          }
        })
        // 合并部门和人员选择
        if (staffIds.length > 0) {
          selectedDepartmentStaffIds.value = [...selectedDepartmentStaffIds.value, ...staffIds]
        }
      }
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
  if (value.length > 5) {
    selectedTopicIds.value = value.slice(0, 5)
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
  ],
  category: [
    { 
      required: true, 
      message: '请选择问题类型', 
      trigger: 'change'
    }
  ]
}

// 确认
const handleConfirm = () => {
  const { dept_ids, staff_codes } = extractDepartmentStaffData()
  const result = {
    dept_ids: dept_ids,
    staff_codes: staff_codes,
    topic_ids: selectedTopicIds.value,
    category: formData.value.category
  }
  emit('confirm', result)
}

// 取消
const handleCancel = () => {
  visible.value = false
}

// 关闭时重置
const handleClose = () => {
  selectedDepartmentStaffIds.value = []
  selectedTopicIds.value = []
  formData.value.category = ''
}
</script>

<style scoped>
.hint-text {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}
</style>



