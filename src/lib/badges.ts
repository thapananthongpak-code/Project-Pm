import type { Counter, GameState } from './game'

export type BadgeRule =
  | { type: 'event' }
  | { type: 'count'; counter: Counter; goal: number }
  | { type: 'mission'; goal: string }
  | { type: 'missions' }
  | { type: 'earned'; goal: number }
  | { type: 'owned'; goal: number }
  | { type: 'equipped'; goal: number }

export interface BadgeDef {
  id: string
  rule: BadgeRule
}

export const MISSIONS = ['m4', 'present', 'image'] as const

/** key ใน claimed ที่บอกว่าทำภารกิจนั้นสำเร็จแล้ว */
export const missionKey = (goal: string) => `mission:${goal}`

/** ความคืบหน้าของตรา: ทำได้เท่าไหร่ จากเป้าเท่าไหร่ (null = ได้จากเหตุการณ์ ไม่มีตัวนับ) */
export function badgeProgress(state: GameState, rule: BadgeRule): { value: number; goal: number } | null {
  switch (rule.type) {
    case 'event':
      return null
    case 'count':
      return { value: state.counts[rule.counter] ?? 0, goal: rule.goal }
    case 'mission':
      return { value: state.claimed.includes(missionKey(rule.goal)) ? 1 : 0, goal: 1 }
    case 'missions':
      return { value: MISSIONS.filter((m) => state.claimed.includes(missionKey(m))).length, goal: MISSIONS.length }
    case 'earned':
      return { value: state.earned, goal: rule.goal }
    case 'owned':
      return { value: state.owned.length, goal: rule.goal }
    case 'equipped':
      return { value: Object.keys(state.equipped).length, goal: rule.goal }
  }
}

/** ตราที่ควรได้จากสถานะปัจจุบัน แต่ยังไม่ได้ */
export function newlyEarned(state: GameState, defs: BadgeDef[]): string[] {
  return defs
    .filter((d) => !state.badges.includes(d.id))
    .filter((d) => {
      const p = badgeProgress(state, d.rule)
      return p !== null && p.value >= p.goal
    })
    .map((d) => d.id)
}
