const PREFIX = 'futela_'

export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(PREFIX + key)
      if (item === null) return defaultValue ?? null
      return JSON.parse(item)
    } catch {
      return defaultValue ?? null
    }
  },

  set(key: string, value: any): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // Storage full or not available
    }
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key)
  },

  clear(): void {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX))
    keys.forEach((k) => localStorage.removeItem(k))
  },

  has(key: string): boolean {
    return localStorage.getItem(PREFIX + key) !== null
  },
}

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  SEARCH_HISTORY: 'search_history',
} as const
