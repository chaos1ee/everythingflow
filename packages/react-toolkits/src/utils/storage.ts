import type { StateStorage } from 'zustand/middleware'

// 通过 SessionStorage 隔离数据，防止多开页面时的数据冲突。
// 当 SessionStorage 不存在时，使用 LocalStorage。
export const mixedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return sessionStorage.getItem(name) || localStorage.getItem(name)
  },
  setItem: (name: string, value: string) => {
    sessionStorage.setItem(name, value)
    localStorage.setItem(name, value)
  },
  removeItem: async (name: string) => {
    sessionStorage.removeItem(name)
    localStorage.removeItem(name)
  },
}
