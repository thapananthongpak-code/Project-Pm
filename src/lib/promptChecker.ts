export interface CheckRule {
  id: string
  label: string
  /** ประโยคที่เติมท้าย prompt ได้ทันที */
  fix: string
  test: (text: string) => boolean
}

export interface CheckResult {
  rule: CheckRule
  pass: boolean
}

export interface Analysis {
  results: CheckResult[]
  passed: number
  total: number
  blanks: number
  tooShort: boolean
}

const has = (re: RegExp) => (text: string) => re.test(text)

export const rules: CheckRule[] = [
  {
    id: 'role',
    label: 'บอกบทบาทให้ AI',
    fix: 'คุณคือครูที่ช่วยนักเรียน ม.3 ทำสไลด์',
    test: has(/คุณคือ|คุณเป็น|ในฐานะ|รับบท|สมมติว่าคุณ|act as|you are/i),
  },
  {
    id: 'task',
    label: 'บอกว่าจะให้ทำอะไร',
    fix: 'ช่วยเขียนเนื้อหาสไลด์ [พอร์ตโฟลิโอ / นำเสนองาน]',
    test: has(/สไลด์|slide|พอร์ต|portfolio|แนะนำตัว|โครงงาน|นำเสนอ|รายงาน|presentation/i),
  },
  {
    id: 'target',
    label: 'บอกว่าใช้กับอะไร',
    fix: 'สำหรับ [สมัคร ม.4 แผนการเรียน __ โรงเรียน __] หรือ [วิชา __ เรื่อง __]',
    test: has(/ม\.\s?4|วิชา|เรื่อง|แผนการเรียน|สายวิทย์|สายศิลป์|วิทย์-คณิต|ห้องเรียนพิเศษ|โรงเรียน|คณะ|สาขา/i),
  },
  {
    id: 'info',
    label: 'ใส่ข้อมูลของตัวเอง',
    fix: 'ข้อมูลของฉัน: [ชื่อ / ความสามารถ / ผลงาน หรือ ประเด็นที่จะนำเสนอ]',
    test: (text) =>
      [/ชื่อ/, /ผลงาน|กิจกรรม|รางวัล/, /ทักษะ|ความสามารถ|ถนัด|เก่ง|ชอบ/, /ประเด็น|หัวข้อ|เนื้อหา/, /เกรด|gpa/i].filter(
        (re) => re.test(text),
      ).length >= 2,
  },
  {
    id: 'structure',
    label: 'บอกจำนวนหน้าหรือโครงสร้าง',
    fix: 'ทำ [__] หน้า ตอบเป็นหัวข้อ "สไลด์ที่ 1, 2, 3..."',
    test: has(/\d+\s*(หน้า|สไลด์|slides?|pages?)|โครงสร้าง|ทีละ(หน้า|สไลด์)|สไลด์ที่\s*\d|^\s*\d+[.)]/im),
  },
  {
    id: 'tone',
    label: 'บอกโทนภาษา',
    fix: 'ใช้ภาษาเป็นกันเอง จริงใจ ไม่เวอร์',
    test: has(/ภาษา|โทน|น้ำเสียง|ทางการ|เป็นกันเอง|จริงใจ|สุภาพ|tone/i),
  },
  {
    id: 'length',
    label: 'จำกัดความยาว',
    fix: 'ข้อความต่อสไลด์ไม่เกิน 3 บรรทัด',
    test: has(/ไม่เกิน|บรรทัด|กระชับ|สั้นๆ|สั้น ๆ|ความยาว|\d+\s*คำ|words?/i),
  },
  {
    id: 'ask',
    label: 'ให้ AI ถามกลับถ้าข้อมูลไม่พอ',
    fix: 'ถ้าข้อมูลไม่พอ ให้ถามฉันก่อน อย่าแต่งข้อมูลเพิ่มเอง',
    test: has(/ถามฉัน|ถามกลับ|ถามก่อน|อย่าแต่ง|ห้ามแต่ง|ask me/i),
  },
]

const BLANK_PATTERN = /\[__\]|\[\s*\]|\[(วาง|ใส่|เติม)[^\]]*\]/g

export function analyzePrompt(text: string): Analysis {
  const results = rules.map((rule) => ({ rule, pass: rule.test(text) }))
  return {
    results,
    passed: results.filter((r) => r.pass).length,
    total: rules.length,
    blanks: text.match(BLANK_PATTERN)?.length ?? 0,
    tooShort: text.trim().length < 80,
  }
}

/** เติมประโยคของข้อที่ขาดต่อท้าย prompt เดิม */
export function improvePrompt(text: string, analysis: Analysis): string {
  const missing = analysis.results.filter((r) => !r.pass).map((r) => r.rule.fix)
  if (missing.length === 0) return text.trim()
  return `${text.trim()}\n\n${missing.join('\n')}`
}

export const weakSample = 'ช่วยทำสไลด์วิทยาศาสตร์ให้หน่อย'
