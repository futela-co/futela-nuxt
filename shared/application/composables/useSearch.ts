export interface UseSearchReturn {
  search: Ref<string>
  clearSearch: () => void
}

export function useSearch(initialValue = ''): UseSearchReturn {
  const search = ref(initialValue)

  const clearSearch = () => {
    search.value = ''
  }

  return {
    search,
    clearSearch,
  }
}
