import { ref, computed } from 'vue'

/**
 * 无限滚动加载 Hook
 * 用于简化列表页的分页加载逻辑
 */
export function useInfiniteScroll<T = any, R extends T = any>(
  fetchFunction: (page: number, pageSize: number, ...args: any[]) => Promise<{
    data: {
      items: R[]
      total?: number
      has_more?: boolean
    }
  }>,
  options: {
    pageSize?: number
    initialPage?: number
    transform?: (item: R) => T
  } = {}
) {
  const {
    pageSize = 20,
    initialPage = 1,
    transform
  } = options

  // 状态
  const list = ref<T[]>([])
  const loading = ref(false)
  const currentPage = ref(initialPage)
  const total = ref(0)
  const hasMore = ref(true)

  // 计算属性
  const isEmpty = computed(() => list.value.length === 0 && !loading.value)
  const noMore = computed(() => !hasMore.value && list.value.length > 0)

  /**
   * 加载数据
   * @param isRefresh 是否是刷新操作（重置列表）
   * @param args 额外参数
   */
  const loadData = async (isRefresh = false, ...args: any[]) => {
    // 如果正在加载或已无更多数据，不重复请求
    if (loading.value || (!isRefresh && !hasMore.value)) {
      return
    }

    try {
      loading.value = true

      // 如果是刷新，重置页码
      if (isRefresh) {
        currentPage.value = initialPage
        list.value = []
        hasMore.value = true
      }

      // 调用接口
      const response = await fetchFunction(currentPage.value, pageSize, ...args)
      const { items, total: totalCount, has_more } = response.data

      // 转换数据（如果提供了转换函数）
      const transformedItems = transform ? items.map(transform) : items

      // 更新列表
      if (isRefresh) {
        list.value = transformedItems as any
      } else {
        list.value.push(...(transformedItems as any))
      }

      // 更新总数
      if (totalCount !== undefined) {
        total.value = totalCount
      }

      // 判断是否还有更多数据
      if (has_more !== undefined) {
        hasMore.value = has_more
      } else if (totalCount !== undefined) {
        hasMore.value = list.value.length < totalCount
      } else {
        // 如果接口没有返回总数或 has_more，根据返回数据量判断
        hasMore.value = items.length >= pageSize
      }

      // 如果还有更多数据，页码+1
      if (hasMore.value) {
        currentPage.value++
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载更多
   */
  const loadMore = async (...args: any[]) => {
    await loadData(false, ...args)
  }

  /**
   * 刷新列表
   */
  const refresh = async (...args: any[]) => {
    await loadData(true, ...args)
  }

  /**
   * 重置状态
   */
  const reset = () => {
    list.value = []
    currentPage.value = initialPage
    total.value = 0
    hasMore.value = true
    loading.value = false
  }

  return {
    // 数据
    list,
    loading,
    currentPage,
    total,
    hasMore,
    isEmpty,
    noMore,
    
    // 方法
    loadMore,
    refresh,
    reset
  }
}

