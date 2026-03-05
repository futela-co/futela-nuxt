export interface PaginatedResponse<T> {
  data: T[]
  total: number
  meta: {
    total: number
    page: number
    itemsPerPage: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  violations?: Record<string, string[]>
}

export interface SelectOption {
  value: string
  label: string
}

export interface BreadcrumbItem {
  label: string
  to?: string
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  class?: string
  format?: (value: any, row: any) => string
}

export interface FilterOption {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'daterange' | 'number'
  options?: SelectOption[]
  placeholder?: string
}
