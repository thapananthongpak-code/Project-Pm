export interface GameState {
  /** เหรียญที่ได้แล้ว */
  badges: string[]
}

export const emptyGame: GameState = { badges: [] }

/** ให้เหรียญ คืน state เดิมถ้าเคยได้แล้ว */
export function applyBadge(state: GameState, badge: string): GameState {
  if (state.badges.includes(badge)) return state
  return { badges: [...state.badges, badge] }
}

export function reviveGame(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object') return emptyGame
  const badges = (raw as Partial<GameState>).badges
  return { badges: Array.isArray(badges) ? badges.filter((x): x is string => typeof x === 'string') : [] }
}
