import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

/** state ที่บันทึกลง localStorage อัตโนมัติ ถ้าอ่าน/เขียนไม่ได้จะใช้ค่าเริ่มต้นแทน */
export function useLocalStorage<T>(
  key: string,
  initial: T,
  revive: (raw: unknown) => T = (raw) => raw as T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return revive(JSON.parse(raw))
    } catch {
      // ข้อมูลเสียหรือเบราว์เซอร์ไม่อนุญาต
    }
    return initial
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // พื้นที่เต็มหรือโหมดส่วนตัว
    }
  }, [key, value])

  return [value, setValue]
}
