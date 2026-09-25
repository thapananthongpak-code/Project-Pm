import { describe, expect, it } from 'vitest'
import { badges, lesson } from '../data'
import { applyAward, emptyGame, reviveGame } from './game'
import { splitSections } from './rtcf'

describe('ระบบดาวและเหรียญ', () => {
  it('ให้ดาวครั้งเดียวต่อ key', () => {
    const once = applyAward(emptyGame, { key: 'page:m4:role', stars: 10 })
    expect(once.stars).toBe(10)
    expect(applyAward(once, { key: 'page:m4:role', stars: 10 })).toBe(once)
    expect(applyAward(once, { key: 'page:m4:target', stars: 10 }).stars).toBe(20)
  })

  it('ได้เหรียญไม่ซ้ำ', () => {
    const a = applyAward(emptyGame, { key: 'done:m4', stars: 50, badge: 'first-prompt' })
    const b = applyAward(a, { key: 'done:present', stars: 50, badge: 'first-prompt' })
    expect(b.badges).toEqual(['first-prompt'])
    expect(b.stars).toBe(100)
  })

  it('อ่านข้อมูลเสียแล้วกลับเป็นค่าเริ่มต้น', () => {
    expect(reviveGame('xx')).toEqual(emptyGame)
    expect(reviveGame({ stars: -5, badges: [1, 'learner'] })).toEqual({ stars: 0, badges: ['learner'], claimed: [] })
  })
})

describe('บทเรียน', () => {
  it('เกมแยกประเภทมีครบทั้ง R T C F', () => {
    expect(new Set(lesson.sort.map((q) => q.answer))).toEqual(new Set(['R', 'T', 'C', 'F']))
    expect(lesson.sort.length).toBeGreaterThanOrEqual(8)
  })

  it('เกมเลือกแบบที่ดีกว่ามีคำอธิบายทุกข้อ', () => {
    for (const q of lesson.pick) {
      expect(q.options).toHaveLength(2)
      expect([0, 1]).toContain(q.better)
      expect(q.why.length).toBeGreaterThan(0)
    }
  })

  it('เหรียญที่เว็บให้มีอยู่ในรายการเหรียญ', () => {
    const ids = badges.map((b) => b.id)
    for (const id of ['learner', 'sorter', 'sharp-eye', 'first-prompt', 'artist', 'checker']) expect(ids).toContain(id)
  })

  it('แยกส่วน prompt ตามหัวข้อ', () => {
    const s = splitSections('บทบาท (Role): คุณคือครู\nงาน (Task): ช่วยสรุป\nบริบท (Context):\n- ฉันเป็นนักเรียน')
    expect(s.map((x) => [x.part, x.lead, x.lines])).toEqual([
      ['R', 'คุณคือครู', []],
      ['T', 'ช่วยสรุป', []],
      ['C', '', ['- ฉันเป็นนักเรียน']],
    ])
  })
})
