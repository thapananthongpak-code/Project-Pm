export interface CheckRule {
  id: string
  label: string
  /** อธิบายว่าทำไมควรมี */
  tip: string
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
    tip: 'บอกว่าอยากให้ AI เป็นใคร คำตอบจะตรงสายขึ้น',
    fix: 'คุณคือที่ปรึกษาการทำพอร์ตโฟลิโอสำหรับนักเรียนไทย',
    test: has(/คุณคือ|คุณเป็น|ในฐานะ|รับบท|สมมติว่าคุณ|act as|you are/i),
  },
  {
    id: 'task',
    label: 'บอกว่าจะให้ทำอะไร',
    tip: 'ระบุชิ้นงานให้ชัด เช่น สไลด์แนะนำตัว หรือพอร์ตสมัครเรียน',
    fix: 'ช่วยเขียนเนื้อหาสไลด์พอร์ตโฟลิโอ [__] หน้า',
    test: has(/สไลด์|slide|พอร์ต|portfolio|แนะนำตัว|โครงงาน|นำเสนอ|presentation/i),
  },
  {
    id: 'target',
    label: 'บอกที่ที่จะสมัครหรือผู้ฟัง',
    tip: 'AI จะเน้นจุดที่ตรงกับคณะ โรงเรียน หรือคนที่จะดู',
    fix: 'เพื่อสมัคร [คณะ/สาขา/มหาวิทยาลัย หรือ โรงเรียน/สายการเรียน]',
    test: has(/ม\.\s?4|tcas|คณะ|สาขา|มหาวิทยาลัย|มหาลัย|วิศวะ|แพทย์|หมอ|นิเทศ|บัญชี|ห้องเรียนพิเศษ|สายวิทย์|สายศิลป์|โรงเรียน|กรรมการ|ผู้ฟัง/i),
  },
  {
    id: 'info',
    label: 'ใส่ข้อมูลของตัวเอง',
    tip: 'AI ไม่รู้จักเรา ต้องบอกชื่อ ทักษะ ผลงาน และกิจกรรมเอง',
    fix: 'ข้อมูลของฉัน: ชื่อ [__] ความสามารถเด่น [__] ผลงาน [__] กิจกรรม [__]',
    test: (text) =>
      [/ชื่อ/, /ผลงาน/, /กิจกรรม/, /ทักษะ|ความสามารถ|ถนัด/, /รางวัล|เกียรติบัตร/, /เกรด|gpa/i].filter((re) => re.test(text))
        .length >= 2,
  },
  {
    id: 'evidence',
    label: 'มีตัวเลขหรือผลลัพธ์ที่จับต้องได้',
    tip: 'ตัวเลขทำให้ผลงานน่าเชื่อ เช่น จำนวนคน เปอร์เซ็นต์ หรือระดับรางวัล',
    fix: 'ผลลัพธ์ของผลงาน: [ตัวเลข เช่น มีผู้ใช้ 150 คน / ลดลง 30%]',
    test: has(
      /\d+(\.\d+)?\s*(%|คน|ครั้ง|เท่า|บาท|ชั่วโมง|วัน|ชิ้น|ทีม)|ระดับ(โรงเรียน|เขต|จังหวัด|ภาค|ประเทศ|ชาติ)|เหรียญ|อันดับ|ชนะเลิศ/,
    ),
  },
  {
    id: 'structure',
    label: 'กำหนดจำนวนหน้าหรือโครงสร้าง',
    tip: 'บอกว่ามีกี่หน้า แต่ละหน้าเป็นเรื่องอะไร',
    fix: 'โครงสร้าง: 1.ปก 2.ฉันคือใคร 3.ทักษะเด่น 4.ผลงาน 5.แรงบันดาลใจ 6.เป้าหมาย',
    test: has(/\d+\s*(หน้า|สไลด์|slides?|pages?)|โครงสร้าง|^\s*\d+[.)]/im),
  },
  {
    id: 'tone',
    label: 'บอกโทนภาษา',
    tip: 'บอกว่าอยากได้ภาษาเป็นกันเองหรือทางการ',
    fix: 'ใช้ภาษาเป็นกันเอง จริงใจ ไม่เวอร์',
    test: has(/ภาษา|โทน|น้ำเสียง|ทางการ|เป็นกันเอง|จริงใจ|สุภาพ|tone/i),
  },
  {
    id: 'length',
    label: 'จำกัดความยาว',
    tip: 'สไลด์ที่ข้อความน้อยอ่านง่ายกว่า กรรมการอ่านจบไว',
    fix: 'ข้อความต่อสไลด์ไม่เกิน 3 บรรทัด',
    test: has(/ไม่เกิน|บรรทัด|กระชับ|สั้นๆ|สั้น ๆ|ความยาว|\d+\s*คำ|words?/i),
  },
  {
    id: 'format',
    label: 'บอกรูปแบบคำตอบ',
    tip: 'ให้แยกเป็นทีละสไลด์ จะคัดลอกไปใช้ต่อได้ง่าย',
    fix: 'ตอบเป็นหัวข้อ "สไลด์ที่ 1, 2, 3..." พร้อมเสนอภาพประกอบแต่ละหน้า',
    test: has(/ตอบเป็น|ทีละ(หน้า|สไลด์)|แต่ละ(หน้า|สไลด์)|รูปแบบ|ตาราง|หัวข้อ|bullet|format|ภาพประกอบ/i),
  },
  {
    id: 'ask',
    label: 'ให้ AI ถามกลับเมื่อข้อมูลไม่พอ',
    tip: 'กัน AI แต่งเรื่องที่ไม่จริงใส่พอร์ตของเรา',
    fix: 'ถ้าข้อมูลไม่พอ ให้ถามฉันก่อนเขียนต่อ อย่าแต่งข้อมูลเพิ่มเอง',
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

export const weakSample = 'ช่วยทำพอร์ตเข้าวิศวะให้หน่อย ฉันชอบเขียนโปรแกรม'
