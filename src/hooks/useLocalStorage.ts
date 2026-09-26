import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

/**
 * state ที่บันทึกลง localStorage อัตโนมัติ ถ้าอ่าน/เขียนไม่ได้จะใช้ค่าเริ่มต้นแทน
 * เปิดหลายแท็บพร้อมกัน: แท็บอื่นเปลี่ยนค่า แท็บนี้จะอัปเดตตาม (กันบันทึกทับกันจนของที่ซื้อหาย)
 */
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
      const json = JSON.stringify(value)
      // เขียนเฉพาะเมื่อค่าเปลี่ยนจริง (กันแท็บสองแท็บส่งค่ากันไปมาไม่จบ)
      if (localStorage.getItem(key) !== json) localStorage.setItem(key, json)
    } catch {
      // พื้นที่เต็มหรือโหมดส่วนตัว
    }
  }, [key, value])

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== key || e.newValue === null) return
      try {
        setValue(revive(JSON.parse(e.newValue)))
      } catch {
        // ค่าที่แท็บอื่นเขียนมาเสีย ไม่ต้องทำอะไร
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key]) // revive เป็นฟังก์ชันคงที่ของแต่ละที่ที่เรียกใช้

  return [value, setValue]
}
