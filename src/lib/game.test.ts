import { describe, expect, it } from 'vitest'
import { badges, lesson } from '../data'
import { applyAward, buyItem, emptyGame, equipItem, fingerprint, quizCoins, reviveGame, type ShopItem } from './game'
import { splitSections } from './rtcf'

describe('ระบบเหรียญและตรารางวัล', () => {
  it('ได้เหรียญครั้งเดียวต่อ key', () => {
    const once = applyAward(emptyGame, { key: 'page:m4:role', coins: 10 })
    expect(once.coins).toBe(10)
    expect(applyAward(once, { key: 'page:m4:role', coins: 10 })).toBe(once)
    expect(applyAward(once, { key: 'page:m4:target', coins: 10 }).coins).toBe(20)
  })

  it('ได้ตรารางวัลไม่ซ้ำ', () => {
    const a = applyAward(emptyGame, { key: 'done:m4', coins: 50, badge: 'first-prompt' })
    const b = applyAward(a, { key: 'done:present', coins: 50, badge: 'first-prompt' })
    expect(b.badges).toEqual(['first-prompt'])
    expect(b.coins).toBe(100)
  })

  it('อ่านข้อมูลเสียเป็นค่าเริ่มต้น และอ่านดาวจากเวอร์ชันก่อนเป็นเหรียญ', () => {
    expect(reviveGame('xx')).toEqual(emptyGame)
    expect(reviveGame({ stars: 120, badges: [1, 'learner'], claimed: ['a'] })).toEqual({
      coins: 120,
      badges: ['learner'],
      claimed: ['a'],
      owned: [],
      equipped: {},
    })
    // ใส่ของที่ไม่ได้ซื้อไม่ได้
    expect(reviveGame({ owned: ['crown'], equipped: { head: 'crown', face: 'sunglasses' } }).equipped).toEqual({ head: 'crown' })
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
  it('มีผู้ช่วย 3-5 ตัว ไม่ซ้ำกัน ไม่มีชื่อ และมีคำลงท้าย', async () => {
    const { buddies } = await import('../data')
    expect(buddies.length).toBeGreaterThanOrEqual(3)
    expect(buddies.length).toBeLessThanOrEqual(5)
    expect(new Set(buddies.map((b) => b.id)).size).toBe(buddies.length)
    for (const b of buddies) {
      expect(b.ending.length).toBeGreaterThan(0)
      expect('name' in b).toBe(false)
    }
  })

  it('มีข้อความทุกหมวด', async () => {
    const { buddyLines } = await import('../data')
    for (const kind of ['greetings', 'cheers', 'oops', 'done', 'tips'] as const) {
      expect(buddyLines[kind].length, kind).toBeGreaterThan(0)
    }
  })
})

describe('บุคลิกผู้ช่วย', () => {
  it('ท่าที่ใช้มีอยู่จริง และแต่ละตัวมีท่าประจำตัวต่างกัน', async () => {
    const { buddies } = await import('../data')
    const { ALL_ACTIONS } = await import('../components/BuddyArt')
    for (const b of buddies) {
      for (const a of [...b.moves, ...b.tap]) expect(ALL_ACTIONS, `${b.id}: ${a}`).toContain(a)
      expect(b.chatter.length, b.id).toBeGreaterThan(0)
      // ขยับไม่ถี่เกินไป: อย่างน้อยทุก 4 วินาที
      expect(b.tempo[0], b.id).toBeGreaterThanOrEqual(4)
      expect(b.tempo[1], b.id).toBeGreaterThan(b.tempo[0])
    }
    const favourite = (id: string) => buddies.find((b) => b.id === id)!.moves
    expect(favourite('cat')).toContain('tailwag')
    expect(favourite('bear')).toContain('sleep')
    expect(favourite('bunny')).toContain('earflop')
    expect(favourite('robot')).toContain('scan')
    expect(favourite('dino')).toContain('roar')
  })
})

describe('เหรียญเล่นซ้ำได้', () => {
  it('รางวัลที่ไม่มี key ได้ทุกครั้ง', () => {
    const a = applyAward(emptyGame, { coins: 5 })
    const b = applyAward(a, { coins: 5 })
    expect(b.coins).toBe(10)
    expect(b.claimed).toEqual([])
  })

  it('ถูกติดกันยิ่งได้เหรียญเยอะ', () => {
    expect([1, 2, 3, 4, 5, 9].map(quizCoins)).toEqual([5, 5, 8, 8, 10, 10])
  })

  it('prompt เดิมได้เหรียญครั้งเดียว prompt ใหม่ได้อีก', () => {
    const k1 = `done:m4:${fingerprint('prompt A')}`
    const k2 = `done:m4:${fingerprint('prompt B')}`
    expect(k1).not.toBe(k2)
    const once = applyAward(emptyGame, { key: k1, coins: 30 })
    expect(applyAward(once, { key: k1, coins: 30 }).coins).toBe(30)
    expect(applyAward(once, { key: k2, coins: 30 }).coins).toBe(60)
  })
})

describe('ร้านค้า', () => {
  const crown: ShopItem = { id: 'crown', slot: 'head', name: 'มงกุฎ', price: 120 }
  const bow: ShopItem = { id: 'bow', slot: 'head', name: 'โบว์', price: 30 }
  const rich = { ...emptyGame, coins: 150 }

  it('ซื้อแล้วหักเหรียญ เก็บเข้าคลัง และใส่ให้เลย', () => {
    const s = buyItem(rich, crown)
    expect(s.coins).toBe(30)
    expect(s.owned).toEqual(['crown'])
    expect(s.equipped.head).toBe('crown')
  })

  it('เหรียญไม่พอหรือมีแล้ว ซื้อไม่ได้', () => {
    expect(buyItem(emptyGame, bow)).toBe(emptyGame)
    const s = buyItem(rich, crown)
    expect(buyItem(s, crown)).toBe(s)
  })

  it('ช่องเดียวใส่ได้ชิ้นเดียว ถอดได้ และใส่ของที่ไม่มีไม่ได้', () => {
    let s = buyItem(buyItem(rich, bow), crown)
    expect(s.equipped.head).toBe('crown')
    s = equipItem(s, 'head', 'bow')
    expect(s.equipped.head).toBe('bow')
    s = equipItem(s, 'head', null)
    expect(s.equipped.head).toBeUndefined()
    expect(equipItem(s, 'face', 'sunglasses')).toBe(s)
  })

  it('ของในร้านถูกต้อง: id ไม่ซ้ำ ช่องถูก ราคาเป็นบวก และมีของแต่ละช่อง', async () => {
    const { shopItems } = await import('../data')
    expect(new Set(shopItems.map((i) => i.id)).size).toBe(shopItems.length)
    for (const i of shopItems) {
      expect(['head', 'face', 'neck']).toContain(i.slot)
      expect(i.price).toBeGreaterThan(0)
    }
    for (const slot of ['head', 'face', 'neck']) expect(shopItems.some((i) => i.slot === slot)).toBe(true)
  })
})
