import { get } from './request'

// 员工信息类型
export interface StaffInfo {
  staff_code: string
  name: string
  is_anonymous_allowed?: boolean  // 是否允许匿名
  is_virtual?: boolean  // 是否为虚拟角色
  virtual_staff_name?: string  // 虚拟角色名称
}

// 部门信息类型
export interface DepartmentInfo {
  dept_id: number
  dept_name: string
  full_name: string
  is_anonymous_allowed?: boolean  // 是否允许匿名
  staffs?: StaffInfo[]
  children?: DepartmentInfo[]
}

// 部门树响应
export interface DepartmentTreeResponse {
  departments: DepartmentInfo[]
  total_departments: number
  total_staffs: number
}

/**
 * 查询部门组织和人员
 */
export interface GetDepartmentTreeParams {
  dept_id?: number
  include_children?: boolean
}

export function getDepartmentTree(params: GetDepartmentTreeParams = {}) {
  return get<DepartmentTreeResponse>('/api/department/tree', {
    include_children: true,
    ...params
  })
}

