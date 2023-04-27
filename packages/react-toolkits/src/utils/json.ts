export const parseJsonStr = (str: string, defaultValue = {}) => {
  try {
    return JSON.parse(str)
  } catch (_) {
    return defaultValue
  }
}

export function isJsonString (value: string) {
  try {
    JSON.parse(value)
  } catch (_) {
    return false
  }

  return true
}
