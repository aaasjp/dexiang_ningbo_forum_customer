<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content mention-modal">
      <div class="modal-header">
        <div class="modal-title">@部门/人员</div>
        <button 
          class="complete-btn" 
          :class="{ disabled: !hasSelectedMembers }"
          @click="handleComplete"
        >
          完成
        </button>
      </div>
      <div class="search-box">
        <el-icon :size="18" class="search-icon">
          <Search />
        </el-icon>
        <input
          v-model="searchText"
          type="text"
          placeholder="搜索部门/人员"
          class="search-input"
        />
      </div>
      <div class="department-list">
        <!-- 部门列表（递归渲染） -->
        <DepartmentTreeNode 
          v-for="dept in filteredDepartments" 
          :key="dept.dept_id"
          :dept="dept"
          :level="0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { DepartmentInfo, StaffInfo } from '@/api/department'
// @ts-ignore
import DepartmentTreeNode from './DepartmentTreeNode.vue'

// 扩展部门类型，添加 expanded 属性
interface DepartmentWithExpanded extends DepartmentInfo {
  expanded?: boolean
  children?: DepartmentWithExpanded[]
}

interface Props {
  show: boolean
  departments: DepartmentInfo[]
  selectedMembers: Map<string, Set<string>>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  complete: [members: string[], selectedMap: Map<string, Set<string>>, isAnonymousAllowed: boolean]
}>()

const searchText = ref('')
// 内部维护的选择状态
const internalSelectedMembers = ref<Map<string, Set<string>>>(new Map())
// 内部维护选中的部门（独立于人员）
const internalSelectedDepartments = ref<Set<number>>(new Set())
// 内部维护部门展开状态
const departmentExpandedState = ref<Map<number, boolean>>(new Map())

// 监听弹窗打开，初始化内部状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 深拷贝外部的选择状态
    internalSelectedMembers.value = new Map()
    internalSelectedDepartments.value = new Set()
    props.selectedMembers.forEach((members, deptId) => {
      internalSelectedMembers.value.set(deptId, new Set(members))
    })
  }
})

// 递归处理部门树，添加展开状态
const processDepartments = (depts: DepartmentInfo[]): DepartmentWithExpanded[] => {
  return depts.map(dept => ({
    ...dept,
    expanded: departmentExpandedState.value.get(dept.dept_id) || false,
    children: dept.children ? processDepartments(dept.children) : []
  }))
}

// 递归搜索部门和成员
const searchDepartments = (depts: DepartmentInfo[], keyword: string): DepartmentWithExpanded[] => {
  const results: DepartmentWithExpanded[] = []
  
  for (const dept of depts) {
    const deptMatch = dept.dept_name.toLowerCase().includes(keyword.toLowerCase())
    const memberMatch = dept.staffs?.some(staff => 
      staff.name.toLowerCase().includes(keyword.toLowerCase())
    ) || false
    
    let childResults: DepartmentWithExpanded[] = []
    if (dept.children && dept.children.length > 0) {
      childResults = searchDepartments(dept.children, keyword)
    }
    
    if (deptMatch || memberMatch || childResults.length > 0) {
      results.push({
        ...dept,
        expanded: true, // 搜索时自动展开
        children: childResults
      })
    }
  }
  
  return results
}

// 过滤部门
const filteredDepartments = computed(() => {
  if (!searchText.value) {
    return processDepartments(props.departments)
  }
  
  return searchDepartments(props.departments, searchText.value)
})

// 判断是否有选中的成员或部门
const hasSelectedMembers = computed(() => {
  let total = internalSelectedDepartments.value.size
  internalSelectedMembers.value.forEach(members => {
    total += members.size
  })
  return total > 0
})

// 递归查找部门
const findDepartment = (depts: DepartmentInfo[], deptId: number): DepartmentInfo | null => {
  for (const dept of depts) {
    if (dept.dept_id === deptId) return dept
    if (dept.children) {
      const found = findDepartment(dept.children, deptId)
      if (found) return found
    }
  }
  return null
}

// 判断部门是否被选中（不检查人员）
const isDepartmentSelected = (deptId: number) => {
  return internalSelectedDepartments.value.has(deptId)
}

// 判断成员是否选中
const isMemberSelected = (deptId: number, staffCode: string) => {
  const deptKey = String(deptId)
  const deptMembers = internalSelectedMembers.value.get(deptKey)
  return deptMembers ? deptMembers.has(staffCode) : false
}

// 收集部门下一级（仅当前部门）所有具有虚拟身份的人员（不包括子部门）
const collectVirtualStaffs = (dept: DepartmentInfo): Array<{ deptId: number, staff: StaffInfo }> => {
  const virtualStaffs: Array<{ deptId: number, staff: StaffInfo }> = []
  
  // 只收集当前部门的虚拟身份人员，不递归子部门
  if (dept.staffs && dept.staffs.length > 0) {
    dept.staffs.forEach(staff => {
      if (staff.is_virtual) {
        virtualStaffs.push({ deptId: dept.dept_id, staff })
      }
    })
  }
  
  return virtualStaffs
}

// 切换部门选择（同时处理虚拟身份人员）
const toggleDepartment = (dept: DepartmentInfo) => {
  const isSelected = isDepartmentSelected(dept.dept_id)
  
  if (isSelected) {
    // 取消选中部门
    internalSelectedDepartments.value.delete(dept.dept_id)
    
    // 取消选中该部门下所有具有虚拟身份的人员
    const virtualStaffs = collectVirtualStaffs(dept)
    virtualStaffs.forEach(({ deptId, staff }) => {
      const deptKey = String(deptId)
      const deptMembers = internalSelectedMembers.value.get(deptKey)
      if (deptMembers && deptMembers.has(staff.staff_code)) {
        deptMembers.delete(staff.staff_code)
      }
    })
  } else {
    // 选中部门
    internalSelectedDepartments.value.add(dept.dept_id)
    
    // 自动选中该部门下所有具有虚拟身份的人员
    const virtualStaffs = collectVirtualStaffs(dept)
    virtualStaffs.forEach(({ deptId, staff }) => {
      const deptKey = String(deptId)
      if (!internalSelectedMembers.value.has(deptKey)) {
        internalSelectedMembers.value.set(deptKey, new Set())
      }
      const deptMembers = internalSelectedMembers.value.get(deptKey)!
      deptMembers.add(staff.staff_code)
    })
  }
}

// 切换成员选择
const toggleMember = (deptId: number, staff: StaffInfo) => {
  const deptKey = String(deptId)
  if (!internalSelectedMembers.value.has(deptKey)) {
    internalSelectedMembers.value.set(deptKey, new Set())
  }
  
  const deptMembers = internalSelectedMembers.value.get(deptKey)!
  
  if (deptMembers.has(staff.staff_code)) {
    deptMembers.delete(staff.staff_code)
  } else {
    deptMembers.add(staff.staff_code)
  }
}

// 递归收集所有选中的成员和部门
const collectSelectedMembers = (depts: DepartmentInfo[]): string[] => {
  const selectedUsers: string[] = []
  
  for (const dept of depts) {
    // 检查部门本身是否被选中
    if (internalSelectedDepartments.value.has(dept.dept_id)) {
      selectedUsers.push(dept.dept_name)
    }
    
    // 检查选中的成员
    const deptKey = String(dept.dept_id)
    const deptMembers = internalSelectedMembers.value.get(deptKey)
    
    if (deptMembers && deptMembers.size > 0 && dept.staffs) {
      // 显示每个选中的成员
      dept.staffs.forEach(staff => {
        if (deptMembers.has(staff.staff_code)) {
          // 如果是虚拟员工，显示 "姓名（虚拟员工名称）"
          const displayName = staff.is_virtual ? `${staff.name}（${staff.virtual_staff_name}）` : staff.name
          selectedUsers.push(displayName)
        }
      })
    }
    
    // 递归处理子部门
    if (dept.children) {
      selectedUsers.push(...collectSelectedMembers(dept.children))
    }
  }
  
  return selectedUsers
}

// 检查选中的部门和成员是否都允许匿名
const checkIsAnonymousAllowed = (depts: DepartmentInfo[]): boolean => {
  for (const dept of depts) {
    // 检查部门本身是否被选中
    if (internalSelectedDepartments.value.has(dept.dept_id)) {
      if (dept.is_anonymous_allowed === false) {
        return false  // 部门不允许匿名
      }
    }
    
    // 检查选中的成员
    const deptKey = String(dept.dept_id)
    const deptMembers = internalSelectedMembers.value.get(deptKey)
    
    if (deptMembers && deptMembers.size > 0 && dept.staffs) {
      // 检查每个选中成员的 is_anonymous_allowed
      for (const staff of dept.staffs) {
        if (deptMembers.has(staff.staff_code)) {
          if (staff.is_anonymous_allowed === false) {
            return false  // 成员不允许匿名
          }
        }
      }
    }
    
    // 递归检查子部门
    if (dept.children) {
      if (!checkIsAnonymousAllowed(dept.children)) {
        return false
      }
    }
  }
  
  return true  // 所有选中的部门和成员都允许匿名
}

// 切换部门展开/收起
const toggleExpand = (deptId: number) => {
  const current = departmentExpandedState.value.get(deptId) || false
  departmentExpandedState.value.set(deptId, !current)
}

// 完成选择
const handleComplete = () => {
  const selectedUsers = collectSelectedMembers(props.departments)
  const isAnonymousAllowed = checkIsAnonymousAllowed(props.departments)
  
  // 构建最终的选择结果 Map
  const finalSelectedMap = new Map(internalSelectedMembers.value)
  
  // 将选中的部门（即使没有选中成员）也添加到 Map 中
  internalSelectedDepartments.value.forEach(deptId => {
    const deptKey = String(deptId)
    if (!finalSelectedMap.has(deptKey)) {
      finalSelectedMap.set(deptKey, new Set())
    }
  })
  
  // 返回选中的成员姓名列表、选中状态 Map 和是否允许匿名
  emit('complete', selectedUsers, finalSelectedMap, isAnonymousAllowed)
}

// 提供给子组件的方法和状态
provide('departmentExpandedState', departmentExpandedState.value)
provide('toggleDepartment', toggleDepartment)
provide('toggleMember', toggleMember)
provide('toggleExpand', toggleExpand)
provide('isDepartmentSelected', isDepartmentSelected)
provide('isMemberSelected', isMemberSelected)
</script>

<style scoped>
/* 弹窗遮罩 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 100vw;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
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

.modal-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #F5F5F5;
}

.modal-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 16px;
  color: #1A1A1A;
}

.complete-btn {
  padding: 6px 20px;
  height: 32px;
  background: #FFDD00;
  color: #1A1A1A;
  border: none;
  border-radius: 16px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.complete-btn:active {
  transform: scale(0.95);
}

.complete-btn.disabled {
  background: #F7F7F7;
  color: #999;
  cursor: not-allowed;
}

.complete-btn.disabled:active {
  transform: none;
}

/* 搜索框 */
.search-box {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F7F7F7;
  margin: 12px 16px;
  border-radius: 20px;
}

.search-icon {
  color: #999;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
}

.search-input::placeholder {
  color: #999;
}

/* 部门列表 */
.department-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}
</style>

