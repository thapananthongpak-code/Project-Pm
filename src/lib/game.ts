export type Slot = 'head' | 'face' | 'neck'
export const SLOTS: Slot[] = ['head', 'face', 'neck']

/** ของที่ใส่อยู่ ช่องละ 1 ชิ้น */
export type Equipped = Partial<Record<Slot, string>>

export interface ShopItem {
  id: string
  slot: Slot
  name: string
  price: number
}

/** ตัวนับสะสม ใช้ปลดล็อกตรารางวัล */
export type Counter = 'prompts' | 'quizRounds' | 'taps'

export interface GameState {
  /** เหรียญที่มีอยู่ (ใช้ซื้อของในร้านได้) */
  coins: number
  /** เหรียญที่เคยได้ทั้งหมด (ไม่ลดเมื่อซื้อของ) */
  earned: number
  counts: Partial<Record<Counter, number>>
  /** ตรารางวัลที่ได้แล้ว */
  badges: string[]
  /** รางวัลที่รับไปแล้ว กันได้เหรียญซ้ำจากเรื่องเดิม */
  claimed: string[]
  /** ของที่ซื้อแล้ว */
  owned: string[]
  equipped: Equipped
}

export interface Award {
  /** ชื่อรางวัลที่ได้ครั้งเดียว เช่น "page:m4:role" (ไม่ใส่ = ได้ทุกครั้ง เช่น ตอบเกมถูก) */
  key?: string
  coins?: number
  badge?: string
  /** เพิ่มตัวนับ 1 ครั้ง */
  count?: Counter
}

export const emptyGame: GameState = { coins: 0, earned: 0, counts: {}, badges: [], claimed: [], owned: [], equipped: {} }

/** ให้รางวัล: ถ้ามี key ได้ครั้งเดียวต่อ key (คืน state เดิมถ้าเคยได้แล้ว) ถ้าไม่มี key ได้ทุกครั้ง */
export function applyAward(state: GameState, award: Award): GameState {
  if (award.key && state.claimed.includes(award.key)) return state
  const coins = award.coins ?? 0
  return {
    ...state,
    coins: state.coins + coins,
    earned: state.earned + Math.max(coins, 0),
    counts: award.count ? { ...state.counts, [award.count]: (state.counts[award.count] ?? 0) + 1 } : state.counts,
    badges: award.badge && !state.badges.includes(award.badge) ? [...state.badges, award.badge] : state.badges,
    claimed: award.key ? [...state.claimed, award.key] : state.claimed,
  }
}

/** เหรียญต่อข้อที่ตอบถูก: ยิ่งถูกติดกันยิ่งได้เยอะ (streak = จำนวนข้อที่ถูกติดกันรวมข้อนี้) */
export function quizCoins(streak: number): number {
  if (streak >= 5) return 10
  if (streak >= 3) return 8
  return 5
}

/** โบนัสเมื่อตอบถูกทุกข้อในรอบ */
export const PERFECT_BONUS = 10
/** เหรียญเมื่อสร้าง prompt ใหม่ที่ไม่ซ้ำเดิมสำเร็จ */
export const MISSION_COINS = 30

/** ลายนิ้วมือสั้นๆ ของข้อความ ใช้แยกว่า prompt นี้เคยได้เหรียญแล้วหรือยัง */
export function fingerprint(text: string): string {
  let h = 5381
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

/** ซื้อของ: หักเหรียญ เก็บเข้าคลัง และใส่ให้เลย คืน state เดิมถ้าซื้อไม่ได้ (มีแล้ว/เหรียญไม่พอ) */
export function buyItem(state: GameState, item: ShopItem): GameState {
  if (state.owned.includes(item.id) || state.coins < item.price) return state
  return {
    ...state,
    coins: state.coins - item.price,
    owned: [...state.owned, item.id],
    equipped: { ...state.equipped, [item.slot]: item.id },
  }
}

/** ใส่/ถอดของที่มีแล้ว (id = null คือถอด) */
export function equipItem(state: GameState, slot: Slot, id: string | null): GameState {
  if (id !== null && !state.owned.includes(id)) return state
  const equipped = { ...state.equipped }
  if (id === null) delete equipped[slot]
  else equipped[slot] = id
  return { ...state, equipped }
}

export function reviveGame(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object') return emptyGame
  const r = raw as Partial<GameState> & { stars?: unknown }
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
  // เวอร์ชันก่อนเรียกเหรียญว่า "ดาว" (stars) อ่านต่อได้
  const coins = typeof r.coins === 'number' ? r.coins : typeof r.stars === 'number' ? r.stars : 0
  const owned = strings(r.owned)
  const equipped: Equipped = {}
  if (r.equipped && typeof r.equipped === 'object') {
    for (const slot of SLOTS) {
      const id = (r.equipped as Record<string, unknown>)[slot]
      if (typeof id === 'string' && owned.includes(id)) equipped[slot] = id
    }
  }
  const counts: GameState['counts'] = {}
  if (r.counts && typeof r.counts === 'object') {
    for (const k of ['prompts', 'quizRounds', 'taps'] as Counter[]) {
      const v = (r.counts as Record<string, unknown>)[k]
      if (typeof v === 'number' && v > 0) counts[k] = v
    }
  }
  const safeCoins = coins >= 0 ? coins : 0
  // เวอร์ชันก่อนไม่ได้เก็บยอดรวม: เริ่มจากเหรียญที่มีอยู่
  const earned = typeof r.earned === 'number' && r.earned >= safeCoins ? r.earned : safeCoins
  return { coins: safeCoins, earned, counts, badges: strings(r.badges), claimed: strings(r.claimed), owned, equipped }
}
