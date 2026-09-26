import { describe, expect, it } from 'vitest'
import { hasSuggestion, toggleSuggestion } from './suggest'

describe('ตัวเลือกด่วน', () => {
  it('เพิ่มเป็นบรรทัดใหม่ และแตะซ้ำเพื่อเอาออก', () => {
    const a = toggleSuggestion('', 'วาดรูป', 'line')
    const b = toggleSuggestion(a, 'เล่นดนตรี', 'line')
    expect(b).toBe('วาดรูป\nเล่นดนตรี')
    expect(toggleSuggestion(b, 'วาดรูป', 'line')).toBe('เล่นดนตรี')
  })

  it('ข้อความที่พิมพ์เองยังอยู่', () => {
    expect(toggleSuggestion('ทำขนมเก่ง', 'วาดรูป', 'line')).toBe('ทำขนมเก่ง\nวาดรูป')
  })

  it('แบบคั่นด้วยจุลภาค', () => {
    const a = toggleSuggestion('แมวน้อย', 'อวกาศ', 'comma')
    expect(a).toBe('แมวน้อย, อวกาศ')
    expect(hasSuggestion(a, 'อวกาศ', 'comma')).toBe(true)
    expect(toggleSuggestion(a, 'แมวน้อย', 'comma')).toBe('อวกาศ')
  })
})
