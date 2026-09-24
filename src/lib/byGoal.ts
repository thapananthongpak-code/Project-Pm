import type { ByGoal, GoalId } from '../types'

/** เลือกข้อความตามเป้าหมาย ถ้าไม่มีใช้ default */
export function byGoal(value: string | ByGoal | undefined, goal: GoalId | null): string {
  if (value === undefined) return ''
  if (typeof value === 'string') return value
  return (goal && value[goal]) ?? value.default ?? ''
}
