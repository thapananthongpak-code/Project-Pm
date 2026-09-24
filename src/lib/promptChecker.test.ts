import { describe, expect, it } from 'vitest'
import { samples } from '../data'
import { buildPrompts } from './promptBuilder'
import { analyzePrompt, improvePrompt, weakSample } from './promptChecker'

describe('analyzePrompt', () => {
  it('prompt สั้นๆ ได้คะแนนต่ำ และบอกว่าสั้นไป', () => {
    const a = analyzePrompt(weakSample)
    expect(a.passed).toBeLessThanOrEqual(3)
    expect(a.tooShort).toBe(true)
  })

  it('prompt ที่เว็บสร้างผ่านเกือบทุกข้อ', () => {
    const tcas = samples.find((s) => s.id === 'sample-tcas')!
    const a = analyzePrompt(buildPrompts('tcas', tcas.answers, 'chatgpt').content)
    expect(a.passed).toBeGreaterThanOrEqual(a.total - 1)
    expect(a.blanks).toBe(0)
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
