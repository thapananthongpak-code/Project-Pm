import { useCallback, useState } from 'react'

const KEY = 'promptfolio:theme'

/** ธีมเริ่มต้นถูกตั้งใน index.html ก่อน render ส่วนนี้ใช้สลับและจำค่า */
export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      try {
        localStorage.setItem(KEY, next ? 'dark' : 'light')
      } catch {
        // โหมดส่วนตัวบางเบราว์เซอร์เขียน localStorage ไม่ได้ ไม่เป็นไร
      }
      return next
    })
  }, [])

  return { dark, toggle }
}
