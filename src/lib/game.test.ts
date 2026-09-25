import { describe, expect, it } from 'vitest'
import { badges, lesson } from '../data'
import { applyBadge, emptyGame, reviveGame } from './game'
import { splitSections } from './rtcf'

describe('ระบบเหรียญ', () => {
  it('ได้เหรียญครั้งเดียว ไม่ซ้ำ', () => {
    const once = applyBadge(emptyGame, 'first-prompt')
    expect(once.badges).toEqual(['first-prompt'])
    expect(applyBadge(once, 'first-prompt')).toBe(once)
    expect(applyBadge(once, 'artist').badges).toEqual(['first-prompt', 'artist'])
  })

  it('อ่านข้อมูลเสียหรือข้อมูลเก่า (มีดาว) แล้วเหลือแค่เหรียญ', () => {
    expect(reviveGame('xx')).toEqual(emptyGame)
    expect(reviveGame({ stars: 120, badges: [1, 'learner'], claimed: ['a'] })).toEqual({ badges: ['learner'] })
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
    expect(badges.map((b) => b.id).sort()).toEqual(['artist', 'first-prompt', 'learner', 'sharp-eye', 'sorter'])
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

describe('ผู้ช่วย', () => {
  it('มีผู้ช่วย 3-5 ตัว ไม่ซ้ำกัน และมีคำลงท้าย', async () => {
    const { buddies } = await import('../data')
    expect(buddies.length).toBeGreaterThanOrEqual(3)
    expect(buddies.length).toBeLessThanOrEqual(5)
    expect(new Set(buddies.map((b) => b.id)).size).toBe(buddies.length)
    for (const b of buddies) expect(b.ending.length).toBeGreaterThan(0)
  })

  it('มีข้อความทุกหมวด', async () => {
    const { buddyLines } = await import('../data')
    for (const kind of ['greetings', 'cheers', 'oops', 'done', 'tips'] as const) {
      expect(buddyLines[kind].length, kind).toBeGreaterThan(0)
    }
  })
})
