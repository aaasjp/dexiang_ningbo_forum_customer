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
        <template v-for="dept in filteredDepartments" :key="dept.dept_id">
          <div class="department-item">
            <div class="department-header" @click="toggleDepartment(dept)">
              <div class="checkbox-wrapper">
                <img v-if="isDepartmentSelected(dept.dept_id)" 
                  @click.stop="toggleDepartment(dept)" 
                  src="../../assets/images/icon/checked.png" 
                  alt="部门" 
                  class="department-icon" 
                  width="18" 
                  height="18" />
                <div 
                  v-else
                  class="checkbox"
                  @click.stop="toggleDepartment(dept)"
                >
                </div>
              </div>
              <div class="department-name">@{{ dept.dept_name }}</div>
              <el-icon 
                v-if="dept.staffs && dept.staffs.length > 0"
                :size="16" 
                class="arrow-icon" 
                :class="{ expanded: dept.expanded }"
                @click.stop="() => {
                  const current = departmentExpandedState.get(dept.dept_id) || false
                  departmentExpandedState.set(dept.dept_id, !current)
                }"
              >
                <ArrowRight />
              </el-icon>
            </div>
            
            <!-- 成员列表 -->
            <div v-if="dept.expanded && dept.staffs && dept.staffs.length > 0" class="members-list">
              <div
                v-for="staff in dept.staffs"
                :key="staff.staff_code"
                class="member-item"
                @click="toggleMember(dept.dept_id, staff)"
              >
                <div class="checkbox-wrapper">
                  <img 
                    v-if="isMemberSelected(dept.dept_id, staff.staff_code)" 
                    @click.stop="toggleMember(dept.dept_id, staff)" 
                    src="../../assets/images/icon/checked.png" 
                    alt="成员" 
                    class="member-icon" 
                    width="18" 
                    height="18" />
                  <div 
                    v-else 
                    class="checkbox" 
                    @click.stop="toggleMember(dept.dept_id, staff)"
                  >
                  </div>
                </div>
                <div class="member-name">@{{ staff.name }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, ArrowRight } from '@element-plus/icons-vue'
import type { DepartmentInfo, StaffInfo } from '@/api/department'

// 扩展部门类型，添加 expanded 属性
interface DepartmentWithExpanded extends DepartmentInfo {
  expanded?: boolean
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
// 内部维护部门展开状态
const departmentExpandedState = ref<Map<number, boolean>>(new Map())

// 监听弹窗打开，初始化内部状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 深拷贝外部的选择状态
    internalSelectedMembers.value = new Map()
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

// 判断是否有选中的成员
const hasSelectedMembers = computed(() => {
  let total = 0
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

// 判断部门是否全选
const isDepartmentSelected = (deptId: number) => {
  const dept = findDepartment(props.departments, deptId)
  if (!dept || !dept.staffs || dept.staffs.length === 0) return false
  
  const deptKey = String(deptId)
  const deptMembers = internalSelectedMembers.value.get(deptKey)
  if (!deptMembers) return false
  
  return dept.staffs.every(staff => deptMembers.has(staff.staff_code))
}

// 判断成员是否选中
const isMemberSelected = (deptId: number, staffCode: string) => {
  const deptKey = String(deptId)
  const deptMembers = internalSelectedMembers.value.get(deptKey)
  return deptMembers ? deptMembers.has(staffCode) : false
}

// 切换部门选择
const toggleDepartment = (dept: DepartmentWithExpanded) => {
  const isSelected = isDepartmentSelected(dept.dept_id)
  const deptKey = String(dept.dept_id)
  
  if (!internalSelectedMembers.value.has(deptKey)) {
    internalSelectedMembers.value.set(deptKey, new Set())
  }
  
  const deptMembers = internalSelectedMembers.value.get(deptKey)!
  
  if (isSelected) {
    // 取消全选
    deptMembers.clear()
  } else {
    // 全选
    dept.staffs?.forEach((staff) => {
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

// 递归收集所有选中的成员
const collectSelectedMembers = (depts: DepartmentInfo[]): string[] => {
  const selectedUsers: string[] = []
  
  for (const dept of depts) {
    const deptKey = String(dept.dept_id)
    const deptMembers = internalSelectedMembers.value.get(deptKey)
    
    if (deptMembers && deptMembers.size > 0 && dept.staffs) {
      // 检查是否选中了整个部门（所有成员都被选中）
      const allSelected = dept.staffs.every(staff => deptMembers.has(staff.staff_code))
      
      if (allSelected) {
        // 如果选中了整个部门，只显示部门名称
        selectedUsers.push(dept.dept_name)
      } else {
        // 如果只选中了部分成员，显示每个成员的名称
        dept.staffs.forEach(staff => {
          if (deptMembers.has(staff.staff_code)) {
            selectedUsers.push(staff.name)
          }
        })
      }
    }
    
    if (dept.children) {
      selectedUsers.push(...collectSelectedMembers(dept.children))
    }
  }
  
  return selectedUsers
}

// 检查选中的部门和成员是否都允许匿名
const checkIsAnonymousAllowed = (depts: DepartmentInfo[]): boolean => {
  for (const dept of depts) {
    const deptKey = String(dept.dept_id)
    const deptMembers = internalSelectedMembers.value.get(deptKey)
    
    if (deptMembers && deptMembers.size > 0 && dept.staffs) {
      // 检查是否选中了整个部门
      const allSelected = dept.staffs.every(staff => deptMembers.has(staff.staff_code))
      
      if (allSelected) {
        // 如果选中了整个部门，检查部门的 is_anonymous_allowed
        if (dept.is_anonymous_allowed === false) {
          return false  // 部门不允许匿名
        }
      } else {
        // 如果只选中了部分成员，检查每个成员的 is_anonymous_allowed
        for (const staff of dept.staffs) {
          if (deptMembers.has(staff.staff_code)) {
            if (staff.is_anonymous_allowed === false) {
              return false  // 成员不允许匿名
            }
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

// 完成选择
const handleComplete = () => {
  const selectedUsers = collectSelectedMembers(props.departments)
  const isAnonymousAllowed = checkIsAnonymousAllowed(props.departments)
  // 返回选中的成员姓名列表、选中状态 Map 和是否允许匿名
  emit('complete', selectedUsers, new Map(internalSelectedMembers.value), isAnonymousAllowed)
}
</script>

<style scoped>
/* 弹窗遮罩 */
.modal-overlay {
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

.department-item {
  margin-bottom: 8px;
}

.department-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  cursor: pointer;
  transition: background 0.2s;
}

.department-header:active {
  background: #FAFAFA;
}

.checkbox-wrapper {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dept-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #E5E5E5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.checkbox.checked {
  background: #FFDD00;
  border-color: #FFDD00;
  color: #1A1A1A;
}

.checkbox.indeterminate {
  background: #FFDD00;
  border-color: #FFDD00;
}

.indeterminate-line {
  width: 10px;
  height: 2px;
  background: #1A1A1A;
  border-radius: 1px;
}

.department-name {
  flex: 1;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
}

.arrow-icon {
  color: #999;
  transition: transform 0.3s;
}

.arrow-icon.expanded {
  transform: rotate(90deg);
}

/* 成员列表 */
.members-list {
  padding-left: 32px;
  background: #FAFAFA;
  border-radius: 8px;
  margin-top: 4px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #F5F5F5;
  cursor: pointer;
  transition: background 0.2s;
}

.member-item:last-child {
  border-bottom: none;
}

.member-item:active {
  background: #F5F5F5;
}

.member-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.member-name {
  flex: 1;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666;
}
.department-icon {
  display: block;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.member-icon {
  display: block;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>

