export interface GameState {
  /** เหรียญที่สะสมได้ */
  coins: number
  /** ตรารางวัลที่ได้แล้ว */
  badges: string[]
  /** รางวัลที่รับไปแล้ว กันได้เหรียญซ้ำจากเรื่องเดิม */
  claimed: string[]
}

export interface Award {
  /** ชื่อรางวัลที่ไม่ซ้ำ เช่น "page:m4:role" */
  key: string
  coins?: number
  badge?: string
}

export const emptyGame: GameState = { coins: 0, badges: [], claimed: [] }

/** ให้รางวัลครั้งเดียวต่อ key คืน state เดิมถ้าเคยได้แล้ว */
export function applyAward(state: GameState, award: Award): GameState {
  if (state.claimed.includes(award.key)) return state
  return {
    coins: state.coins + (award.coins ?? 0),
    badges: award.badge && !state.badges.includes(award.badge) ? [...state.badges, award.badge] : state.badges,
    claimed: [...state.claimed, award.key],
  }
}

export function reviveGame(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object') return emptyGame
  const r = raw as Partial<GameState> & { stars?: unknown }
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
  // เวอร์ชันก่อนเรียกเหรียญว่า "ดาว" (stars) อ่านต่อได้
  const coins = typeof r.coins === 'number' ? r.coins : typeof r.stars === 'number' ? r.stars : 0
  return { coins: coins >= 0 ? coins : 0, badges: strings(r.badges), claimed: strings(r.claimed) }
}
