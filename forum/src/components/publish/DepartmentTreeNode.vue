<template>
  <div class="department-item">
    <div class="department-header">
      <div class="checkbox-wrapper" @click.stop="handleToggleDepartment">
        <img v-if="isDepartmentSelected(dept.dept_id)" 
          src="../../assets/images/icon/checked.png" 
          alt="部门" 
          class="department-icon" 
          width="18" 
          height="18" />
        <div v-else class="checkbox"></div>
      </div>
      <div class="department-name" @click="handleToggleExpand">@{{ dept.dept_name }}</div>
      <el-icon 
        v-if="hasContent"
        :size="16" 
        class="arrow-icon" 
        :class="{ expanded: isExpanded }"
        @click.stop="handleToggleExpand"
      >
        <ArrowRight />
      </el-icon>
    </div>
    
    <!-- 成员列表和子部门 -->
    <div v-if="isExpanded" class="expanded-content">
      <!-- 成员列表 -->
      <div v-if="dept.staffs && dept.staffs.length > 0" class="members-list">
        <div
          v-for="staff in dept.staffs"
          :key="staff.staff_code"
          class="member-item"
          @click="handleToggleMember(staff)"
        >
          <div class="checkbox-wrapper">
            <img 
              v-if="isMemberSelected(dept.dept_id, staff.staff_code)" 
              src="../../assets/images/icon/checked.png" 
              alt="成员" 
              class="member-icon" 
              width="18" 
              height="18" />
            <div v-else class="checkbox"></div>
          </div>
          <div class="member-name">@{{ staff.name }}</div>
        </div>
      </div>
      
      <!-- 子部门（递归） -->
      <DepartmentTreeNode
        v-for="child in dept.children"
        :key="child.dept_id"
        :dept="child"
        :level="level + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import type { DepartmentInfo, StaffInfo } from '@/api/department'

interface DepartmentWithExpanded extends DepartmentInfo {
  expanded?: boolean
}

interface Props {
  dept: DepartmentWithExpanded
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 0
})

// 从父组件注入方法
const departmentExpandedState = inject<Map<number, boolean>>('departmentExpandedState')!
const toggleDepartment = inject<(dept: DepartmentInfo) => void>('toggleDepartment')!
const toggleMember = inject<(deptId: number, staff: StaffInfo) => void>('toggleMember')!
const toggleExpand = inject<(deptId: number) => void>('toggleExpand')!
const isDepartmentSelected = inject<(deptId: number) => boolean>('isDepartmentSelected')!
const isMemberSelected = inject<(deptId: number, staffCode: string) => boolean>('isMemberSelected')!

// 是否展开
const isExpanded = computed(() => {
  return departmentExpandedState.get(props.dept.dept_id) || false
})

// 是否有内容（成员或子部门）
const hasContent = computed(() => {
  return (props.dept.staffs && props.dept.staffs.length > 0) || 
         (props.dept.children && props.dept.children.length > 0)
})

// 切换部门选择
const handleToggleDepartment = () => {
  toggleDepartment(props.dept)
}

// 切换展开状态
const handleToggleExpand = () => {
  toggleExpand(props.dept.dept_id)
}

// 切换成员选择
const handleToggleMember = (staff: StaffInfo) => {
  toggleMember(props.dept.dept_id, staff)
}
</script>

<style scoped>
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

.expanded-content {
  margin-left: 30px;
}

.members-list {
  padding-left: 2px;
  background: #FAFAFA;
  border-radius: 8px;
  margin-top: 4px;
  margin-bottom: 4px;
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

