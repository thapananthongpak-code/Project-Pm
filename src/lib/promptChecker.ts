import type { RtcfPart } from '../types'
import { PARTS, partHeading } from './rtcf'

export interface CheckRule {
  id: string
  /** ส่วนของ RTCF ที่กฎนี้ตรวจ ('bonus' = เคล็ดลับเสริม ไม่นับเป็นส่วนหลัก) */
  part: RtcfPart | 'bonus'
  label: string
  /** ประโยคที่เติมท้าย prompt ได้ทันที */
  fix: string
  test: (text: string) => boolean
}

export interface CheckResult {
  rule: CheckRule
  pass: boolean
}

export type PartStatus = 'none' | 'some' | 'all'

export interface Analysis {
  results: CheckResult[]
  passed: number
  total: number
  /** แต่ละส่วน R/T/C/F มีครบไหม */
  parts: Record<RtcfPart, PartStatus>
  /** มีครบทั้ง 4 ส่วนอย่างน้อยส่วนละ 1 ข้อ */
  complete: boolean
  blanks: number
  tooShort: boolean
}

const has = (re: RegExp) => (text: string) => re.test(text)

export const rules: CheckRule[] = [
  {
    id: 'role',
    part: 'R',
    label: 'บอกว่าให้ AI เป็นใคร',
    fix: 'คุณคือ[ผู้เชี่ยวชาญเรื่องนี้ เช่น ครูวิทยาศาสตร์]',
    test: has(/คุณคือ|คุณเป็น|ในฐานะ|รับบท|สมมติว่าคุณ|\(role\)|act as|you are/i),
  },
  {
    id: 'task',
    part: 'T',
    label: 'บอกงานด้วยคำกริยา',
    fix: 'ช่วย[เขียน / สรุป / อธิบาย / สร้าง] [สิ่งที่ต้องการ]',
    test: has(/ช่วย|เขียน|สรุป|อธิบาย|สร้าง|ออกแบบ|วาด|แปล|เปรียบเทียบ|วางแผน|วางโครง|คิด|ทำ|write|create|explain|summari[sz]e/i),
  },
  {
    id: 'who',
    part: 'C',
    label: 'บอกว่าเราเป็นใคร หรือใครจะดู',
    fix: 'ฉันเป็นนักเรียน ม.3 ผู้ฟังคือ[__]',
    test: has(/ฉันเป็น|ฉันคือ|ฉันชื่อ|นักเรียน|ผู้ฟัง|ผู้อ่าน|ผู้ดู|คนดู|คนอ่าน|กลุ่มเป้าหมาย|ม\.\s?\d/),
  },
  {
    id: 'info',
    part: 'C',
    label: 'บอกจุดประสงค์หรือข้อมูลที่มี',
    fix: 'ใช้สำหรับ[__] ข้อมูลที่ฉันมีคือ[__]',
    test: has(/เพื่อ|สำหรับ|ใช้ใน|ใช้ตอน|ข้อมูล|ประเด็น|ผลงาน|กิจกรรม|ความสามารถ|วิชา|คณะ|แผนการเรียน|ม\.\s?4|นาที/),
  },
  {
    id: 'shape',
    part: 'F',
    label: 'บอกหน้าตาคำตอบ',
    fix: 'ตอบเป็น[ข้อ / ตาราง / สไลด์ __ หน้า]',
    test: has(/\d+\s*(หน้า|สไลด์|ข้อ|บรรทัด|คำ|ภาพ|แบบ)|ตาราง|เป็นข้อ|ทีละ|ตอบเป็น|รูปแบบ|หัวข้อ|สัดส่วน|สไตล์|format|bullet/i),
  },
  {
    id: 'tone',
    part: 'F',
    label: 'บอกโทนภาษา',
    fix: 'ใช้ภาษาง่ายๆ เป็นกันเอง',
    test: has(/ภาษา|โทน|น้ำเสียง|ทางการ|เป็นกันเอง|จริงใจ|สุภาพ|tone/i),
  },
  {
    id: 'length',
    part: 'F',
    label: 'จำกัดความยาว',
    fix: 'ความยาวไม่เกิน[__]',
    test: has(/ไม่เกิน|บรรทัด|กระชับ|สั้นๆ|สั้น ๆ|ความยาว|\d+\s*คำ|words?/i),
  },
  {
    id: 'ask',
    part: 'bonus',
    label: 'เคล็ดลับ: ให้ AI ถามกลับถ้าข้อมูลไม่พอ',
    fix: 'ถ้าข้อมูลไม่พอ ให้ถามฉันก่อน อย่าแต่งข้อมูลเพิ่มเอง',
    test: has(/ถามฉัน|ถามกลับ|ถามก่อน|อย่าแต่ง|ห้ามแต่ง|ask me/i),
  },
]

const BLANK_PATTERN = /\[__\]|\[\s*\]|\[(วาง|ใส่|เติม)[^\]]*\]/g

export function analyzePrompt(text: string): Analysis {
  const results = rules.map((rule) => ({ rule, pass: rule.test(text) }))
  const parts = Object.fromEntries(
    PARTS.map((p) => {
      const own = results.filter((r) => r.rule.part === p)
      const ok = own.filter((r) => r.pass).length
      return [p, ok === 0 ? 'none' : ok === own.length ? 'all' : 'some']
    }),
  ) as Record<RtcfPart, PartStatus>
  return {
    results,
    passed: results.filter((r) => r.pass).length,
    total: rules.length,
    parts,
    complete: PARTS.every((p) => parts[p] !== 'none'),
    blanks: text.match(BLANK_PATTERN)?.length ?? 0,
    tooShort: text.trim().length < 80,
  }
}

/** เติมส่วนที่ขาดต่อท้าย prompt เดิม จัดเป็นหัวข้อ RTCF ให้เห็นว่าแต่ละบรรทัดเป็นส่วนไหน */
export function improvePrompt(text: string, analysis: Analysis): string {
  const missing = analysis.results.filter((r) => !r.pass).map((r) => r.rule)
  if (missing.length === 0) return text.trim()
  const blocks = PARTS.flatMap((p) => {
    // เคล็ดลับเสริมใส่ไว้ในส่วนรูปแบบ
    const fixes = missing.filter((r) => r.part === p || (p === 'F' && r.part === 'bonus')).map((r) => r.fix)
    if (fixes.length === 0) return []
    if (p === 'R' || p === 'T') return [`${partHeading[p]}: ${fixes.join(' ')}`]
    return [`${partHeading[p]}:`, ...fixes.map((f) => `- ${f}`)]
  })
  return `${text.trim()}\n\n${blocks.join('\n')}`
}

export const weakSample = 'ช่วยทำสไลด์วิทยาศาสตร์ให้หน่อย'
