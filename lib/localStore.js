export default function connect(key, defaultValue = null) {
  return {
    get current() {
      const value = localStorage.getItem(key)
      if (value === null) return defaultValue
      return JSON.parse(value)
    },
    save(newValue) {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
  }
}
