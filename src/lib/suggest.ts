export type Join = 'line' | 'comma'

const SEP: Record<Join, RegExp> = { line: /\n/, comma: /\s*,\s*|\n/ }
const GLUE: Record<Join, string> = { line: '\n', comma: ', ' }

/** แยกคำตอบเป็นรายการ */
export function splitItems(value: string, join: Join): string[] {
  return value
    .split(SEP[join])
    .map((s) => s.trim())
    .filter(Boolean)
}

export function hasSuggestion(value: string, s: string, join: Join): boolean {
  return splitItems(value, join).includes(s)
}

/** แตะตัวเลือกด่วน: ถ้ายังไม่มีให้เพิ่มต่อท้าย ถ้ามีแล้วให้เอาออก (ข้อความที่พิมพ์เองยังอยู่ครบ) */
export function toggleSuggestion(value: string, s: string, join: Join): string {
  const items = splitItems(value, join)
  const next = items.includes(s) ? items.filter((x) => x !== s) : [...items, s]
  return next.join(GLUE[join])
}
