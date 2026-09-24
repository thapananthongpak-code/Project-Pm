import { describe, expect, it } from 'vitest'
import { buildPrompts } from './promptBuilder'
import { analyzePrompt, improvePrompt, weakSample } from './promptChecker'

describe('analyzePrompt', () => {
  it('prompt สั้นๆ ได้คะแนนต่ำ', () => {
    expect(analyzePrompt(weakSample).passed).toBeLessThanOrEqual(3)
  })

  it('prompt ที่เว็บสร้างผ่านทุกข้อ', () => {
    const answers = { subject: 'วิทยาศาสตร์', topic: 'ระบบสุริยะ', keyPoints: 'ดาวเคราะห์ 8 ดวง', fullName: 'ข้าวหอม' }
    for (const goal of ['m4', 'present'] as const) {
      const a = analyzePrompt(buildPrompts(goal, answers, 'chatgpt').content)
      expect(a.passed, goal).toBe(a.total)
    }
  })

  it('นับช่องที่ยังไม่เติม', () => {
    expect(analyzePrompt('ชื่อ [__] ผลงาน [ ] [วางเนื้อหาตรงนี้]').blanks).toBe(3)
  })
})

describe('improvePrompt', () => {
  it('เติมประโยคของข้อที่ขาดต่อท้าย แล้วคะแนนเต็ม', () => {
    const improved = improvePrompt(weakSample, analyzePrompt(weakSample))
    expect(improved.startsWith(weakSample)).toBe(true)
    const again = analyzePrompt(improved)
    expect(again.passed).toBe(again.total)
  })
})
