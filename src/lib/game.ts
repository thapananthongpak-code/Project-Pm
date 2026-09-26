export type Slot = 'head' | 'face' | 'neck'
export const SLOTS: Slot[] = ['head', 'face', 'neck']

/** ของที่ใส่อยู่ ช่องละ 1 ชิ้น */
export type Equipped = Partial<Record<Slot, string>>

/** ช่องของในร้าน: ของแต่งตัว หรือ ตัวละครพิเศษ ("buddy") */
export type ShopSlot = Slot | 'buddy'

/** id ของตัวละครพิเศษในคลัง เช่น "buddy:unicorn" */
export const buddyItemId = (buddyId: string) => `buddy:${buddyId}`

export interface ShopItem {
  id: string
  slot: ShopSlot
  name: string
  price: number
}

/** ตัวนับสะสม ใช้ปลดล็อกตรารางวัล */
export type Counter = 'prompts' | 'quizRounds' | 'taps'

/** ตัวนับรายวัน ใช้ลดเหรียญเมื่อเล่นซ้ำเยอะในวันเดียว (กันปั่นเหรียญ) */
export type DailyCounter = 'quizRounds' | 'prompts'
export interface Daily {
  /** วันที่แบบ YYYY-MM-DD ตามเวลาเครื่อง */
  day: string
  quizRounds: number
  prompts: number
}

export interface GameState {
  /** เหรียญที่มีอยู่ (ใช้ซื้อของในร้านได้) */
  coins: number
  /** เหรียญที่เคยได้ทั้งหมด (ไม่ลดเมื่อซื้อของ) */
  earned: number
  counts: Partial<Record<Counter, number>>
  daily: Daily
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
  /** เพิ่มตัวนับรายวัน 1 ครั้ง */
  daily?: DailyCounter
}

/** วันนี้ (YYYY-MM-DD ตามเวลาเครื่อง) */
export function todayKey(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** ทำไปกี่ครั้งแล้ววันนี้ */
export function dailyCount(state: GameState, counter: DailyCounter, day = todayKey()): number {
  return state.daily.day === day ? state.daily[counter] : 0
}

export const emptyGame: GameState = {
  coins: 0,
  earned: 0,
  counts: {},
  daily: { day: '', quizRounds: 0, prompts: 0 },
  badges: [],
  claimed: [],
  owned: [],
  equipped: {},
}

/** ให้รางวัล: ถ้ามี key ได้ครั้งเดียวต่อ key (คืน state เดิมถ้าเคยได้แล้ว) ถ้าไม่มี key ได้ทุกครั้ง */
export function applyAward(state: GameState, award: Award): GameState {
  if (award.key && state.claimed.includes(award.key)) return state
  const coins = award.coins ?? 0
  return {
    ...state,
    coins: state.coins + coins,
    earned: state.earned + Math.max(coins, 0),
    counts: award.count ? { ...state.counts, [award.count]: (state.counts[award.count] ?? 0) + 1 } : state.counts,
    daily: award.daily ? bumpDaily(state.daily, award.daily) : state.daily,
    badges: award.badge && !state.badges.includes(award.badge) ? [...state.badges, award.badge] : state.badges,
    claimed: award.key ? [...state.claimed, award.key] : state.claimed,
  }
}

function bumpDaily(daily: Daily, counter: DailyCounter): Daily {
  const day = todayKey()
  const base = daily.day === day ? daily : { day, quizRounds: 0, prompts: 0 }
  return { ...base, [counter]: base[counter] + 1 }
}

// ---------- สมดุลเหรียญ (ปรับตัวเลขได้ที่นี่) ----------

/** เล่นแบบทดสอบได้เหรียญเต็มกี่รอบต่อวัน หลังจากนั้นได้ครึ่งเดียว */
export const FULL_ROUNDS_PER_DAY = 4
/** โบนัสเมื่อตอบถูกทุกข้อในรอบ */
export const PERFECT_BONUS = 10
/** เหรียญเมื่อสร้าง prompt ใหม่ที่ไม่ซ้ำเดิมสำเร็จ */
export const MISSION_COINS = 30
/** สร้าง prompt ใหม่ได้เหรียญเต็มกี่ครั้งต่อวัน */
export const FULL_PROMPTS_PER_DAY = 5
/** เหรียญต่อ prompt ใหม่ เมื่อเกินจำนวนต่อวันแล้ว */
export const MISSION_COINS_TIRED = 5

/** เหรียญต่อข้อที่ตอบถูก: ยิ่งถูกติดกันยิ่งได้เยอะ (streak = จำนวนข้อที่ถูกติดกันรวมข้อนี้) tired = เล่นเกินรอบต่อวันแล้ว */
export function quizCoins(streak: number, tired = false): number {
  const coins = streak >= 5 ? 10 : streak >= 3 ? 8 : 5
  return tired ? Math.ceil(coins / 2) : coins
}

export function perfectBonus(tired = false): number {
  return tired ? Math.ceil(PERFECT_BONUS / 2) : PERFECT_BONUS
}

/** เหรียญจาก prompt ใหม่ ตามจำนวนที่สร้างไปแล้ววันนี้ */
export function missionCoins(promptsToday: number): number {
  return promptsToday >= FULL_PROMPTS_PER_DAY ? MISSION_COINS_TIRED : MISSION_COINS
}

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
    // ของแต่งตัวใส่ให้เลย ส่วนตัวละครพิเศษเลือกใช้ที่หน้าเลือกผู้ช่วย/ร้านค้า
    equipped: item.slot === 'buddy' ? state.equipped : { ...state.equipped, [item.slot]: item.id },
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
  const d = (r.daily ?? {}) as Partial<Daily>
  const daily: Daily = {
    day: typeof d.day === 'string' ? d.day : '',
    quizRounds: typeof d.quizRounds === 'number' ? d.quizRounds : 0,
    prompts: typeof d.prompts === 'number' ? d.prompts : 0,
  }
  return { coins: safeCoins, earned, counts, daily, badges: strings(r.badges), claimed: strings(r.claimed), owned, equipped }
}
