import { describe, expect, it } from 'vitest'
import { templates } from '../data'
import type { Answers } from '../types'
import { BLANK, buildPrompts, buildRefinePrompt, countBlanks, fillTemplate, firstBlankPage, firstIncompletePage } from './promptBuilder'
import { visibleFields, visibleQuestions } from './visible'

const m4: Answers = {
  fullName: 'ธนพร ใจดี',
  nickname: 'น้ำใส',
  school: 'โรงเรียนวัดสุทธิวราราม',
  gpa: '3.78',
  strengths: 'ชอบทดลองวิทยาศาสตร์\nวาดรูปในแท็บเล็ต',
  works: 'โครงงานรดน้ำอัตโนมัติ ลดการใช้น้ำ 30%',
  track: 'วิทย์-คณิต',
  target: 'โรงเรียนสวนกุหลาบวิทยาลัย',
  inspiration: 'อยากช่วยพ่อรดน้ำสวน',
}

const present: Answers = {
  subject: 'วิทยาศาสตร์',
  topic: 'ระบบสุริยะ',
  keyPoints: 'ดาวเคราะห์ 8 ดวง\nทำไมโลกมีสิ่งมีชีวิต',
  fullName: 'กลุ่มดาวเหนือ ม.3/2',
}

describe('fillTemplate', () => {
  it('แทนคำตอบ และใส่ [__] ในช่องบังคับที่ว่าง', () => {
    expect(fillTemplate('ชื่อ: {{fullName}}\nเรื่อง {{topic}}', { fullName: 'ภูมิ' })).toBe(`ชื่อ: ภูมิ\nเรื่อง ${BLANK}`)
  })

  it('ตัดบรรทัด "หัวข้อ: {{x}}" ที่ไม่บังคับและว่างทิ้ง', () => {
    expect(fillTemplate('- ชื่อ: {{fullName}}\n- รางวัล: {{awards}}', { fullName: 'ภูมิ' })).toBe('- ชื่อ: ภูมิ')
  })

  it('รวมคำตอบหลายบรรทัดเป็นบรรทัดเดียว และไม่แสดงวงเล็บชื่อเล่นว่าง', () => {
    const out = fillTemplate('{{fullName}} ({{nickname}}) เก่ง {{strengths}}', { fullName: 'ภูมิ', strengths: 'a\n\n b ' })
    expect(out).toBe('ภูมิ เก่ง a / b')
  })
})

describe('buildPrompts', () => {
  it('พอร์ต ม.4 ครบ ไม่มีช่องว่าง', () => {
    const { content, design } = buildPrompts('m4', m4, 'chatgpt')
    expect(countBlanks(content) + countBlanks(design)).toBe(0)
    expect(content).toContain('เพื่อสมัคร ม.4 แผนการเรียนวิทย์-คณิต โรงเรียนสวนกุหลาบวิทยาลัย')
    expect(content).toContain('นักเรียน ม.3')
    expect(content).not.toContain('รางวัล:') // ไม่ได้ตอบ จึงตัดทิ้ง
    expect(design).toContain('นำเนื้อหาข้างต้นมาทำเป็นสไลด์พอร์ตโฟลิโอ 10 หน้า')
    expect(design).toContain('โทนสีที่เข้ากับเนื้อหา') // ค่าเริ่มต้นเมื่อไม่ได้เลือก
    expect(design).toContain('PowerPoint (.pptx)')
  })

  it('สื่อนำเสนอ ใส่วิชาและหัวข้อ', () => {
    const { content, design } = buildPrompts('present', present, 'chatgpt')
    expect(countBlanks(content)).toBe(0)
    expect(content).toContain('วิชา/กิจกรรม: วิทยาศาสตร์')
    expect(content).toContain('เรื่อง: ระบบสุริยะ')
    expect(content).toContain('ภาษาสุภาพ เข้าใจง่าย')
    expect(content).not.toContain('เวลานำเสนอ') // ไม่ได้เลือก จึงตัดทิ้ง
    expect(design).toContain('ทำเป็นสไลด์นำเสนอ 8 หน้า')
  })

  it('เลือกวิชา "อื่นๆ" ใช้ชื่อที่พิมพ์เอง', () => {
    const { content } = buildPrompts('present', { ...present, subject: 'อื่นๆ', subjectOther: 'ชุมนุมหุ่นยนต์' }, 'claude')
    expect(content).toContain('วิชา/กิจกรรม: ชุมนุมหุ่นยนต์')
    expect(content).not.toContain('อื่นๆ')
  })

  it('ขั้นทำสไลด์ปรับตาม AI ที่เลือก', () => {
    expect(buildPrompts('m4', m4, 'gemini').design).toContain('Canvas')
    expect(buildPrompts('m4', m4, 'claude').design).toContain('.pptx')
    const { content, tool } = buildPrompts('m4', m4, null)
    expect(tool.id).toBe('chatgpt') // ไม่ได้เลือก ใช้ตัวแรก
    expect(content).toContain('สไลด์ที่ 1, 2, 3')
  })
})

describe('buildRefinePrompt', () => {
  it('ใช้ข้อความต่อยอดและผู้ฟังตามเป้าหมาย', () => {
    expect(buildRefinePrompt('m4', 'shorter')).toBe(
      'ปรับเนื้อหาข้างต้นให้สั้นลง 30% โดยเก็บตัวเลขและผลลัพธ์สำคัญไว้ครบ\nและเพิ่มประโยคเปิดที่ทำให้กรรมการจำฉันได้',
    )
    expect(buildRefinePrompt('present', 'shorter')).toContain('เพื่อนและครู')
  })
})

describe('หน้าคำถาม', () => {
  it('ช่อง "ระบุวิชา" แสดงเฉพาะเมื่อเลือก "อื่นๆ"', () => {
    const q = visibleQuestions('present')[0]
    expect(visibleFields(q, 'present', { subject: 'ศิลปะ' }).map((f) => f.id)).not.toContain('subjectOther')
    expect(visibleFields(q, 'present', { subject: 'อื่นๆ' }).map((f) => f.id)).toContain('subjectOther')
  })

  it('ชี้หน้าแรกที่ช่องบังคับยังว่าง', () => {
    expect(firstIncompletePage('m4', {})).toBe(0)
    expect(firstIncompletePage('m4', m4)).toBe(-1)
    expect(firstIncompletePage('present', { ...present, subject: 'อื่นๆ' })).toBe(0)
  })

  it('"กลับไปเติม" ชี้หน้าที่มีช่องซึ่งกลายเป็น [__]', () => {
    const idx = firstBlankPage('m4', { ...m4, school: '' })
    expect(visibleQuestions('m4')[idx].id).toBe('basic')
    expect(firstBlankPage('m4', m4)).toBe(-1)
  })

  it('แต่ละเป้าหมายมีคำถามไม่เกิน 5 หน้า', () => {
    expect(visibleQuestions('m4').length).toBeLessThanOrEqual(5)
    expect(visibleQuestions('present').length).toBeLessThanOrEqual(5)
  })
})

describe('templates.json', () => {
  it('มีเทมเพลตอย่างน้อย 4 แบบ และทุกเป้าหมายมีเทมเพลตเนื้อหา', () => {
    expect(templates.length).toBeGreaterThanOrEqual(4)
    for (const goal of ['m4', 'present'] as const) {
      expect(templates.some((t) => t.stage === 'content' && t.goals.includes(goal))).toBe(true)
    }
  })
})

describe('buildImagePrompt', () => {
  it('ค่าเริ่มต้น: พอร์ต ม.4 ได้ตัวการ์ตูนของฉัน ใช้เรื่องราวจากคำตอบ', async () => {
    const { buildImagePrompt } = await import('./promptBuilder')
    const text = buildImagePrompt('m4', m4, 'chatgpt')
    expect(text).toContain('ตัวละครการ์ตูนครึ่งตัว')
    expect(text).toContain('การ์ตูนชิบิน่ารัก')
    expect(text).toContain('นักเรียนไทย ม.3 ใส่ชุดนักเรียน')
    expect(text).toContain('ฉันชอบทดลองวิทยาศาสตร์ และกำลังจะเรียนต่อสายวิทย์-คณิต')
    expect(text).toContain('ห้ามใส่ตัวหนังสือ')
    expect(text).toContain('สร้างเป็นรูปภาพ 1 รูป')
    expect(countBlanks(text)).toBe(0)
  })

  it('สื่อนำเสนอ + ไอคอน + Claude: ไม่มีตัวละคร ใช้ประเด็นเป็นไอคอน และวาดเป็น SVG', async () => {
    const { buildImagePrompt } = await import('./promptBuilder')
    const text = buildImagePrompt(
      'present',
      { ...present, imageSubject: 'ไอคอนหัวข้อ', imageStyle: 'พิกเซลอาร์ต' },
      'claude',
    )
    expect(text).not.toContain('ตัวละคร:')
    expect(text).toContain('ไอคอนละ 1 เรื่อง: ดาวเคราะห์ 8 ดวง, ทำไมโลกมีสิ่งมีชีวิต')
    expect(text).toContain('พิกเซลอาร์ต')
    expect(text).toContain('SVG')
  })

  it('ใส่หน้าตาตัวละครที่ผู้ใช้พิมพ์', async () => {
    const { buildImagePrompt } = await import('./promptBuilder')
    const text = buildImagePrompt('present', { ...present, imageLook: 'ผมสั้น ใส่แว่น' }, 'gemini')
    expect(text).toContain('ใส่ชุดนักเรียน ผมสั้น ใส่แว่น')
    expect(text).toContain('วิทยาศาสตร์ เรื่อง ระบบสุริยะ')
  })
})

describe('หัวข้อสร้างภาพ', () => {
  const answers: Answers = {
    imageDesc: 'แมวใส่ชุดนักเรียน\nนั่งอ่านหนังสือ',
    imagePurpose: 'ปกรายงาน',
    imageStyle: 'สีน้ำ',
  }

  it('มีคำถาม 2 หน้า ไม่ถามชื่อหรือจำนวนหน้า', () => {
    expect(visibleQuestions('image').map((q) => q.id)).toEqual(['imageWhat', 'imageLookAndFeel'])
  })

  it('สร้าง prompt จากคำบรรยาย การใช้งาน และสไตล์', async () => {
    const { buildFreeImagePrompt } = await import('./promptBuilder')
    const text = buildFreeImagePrompt(answers, 'chatgpt')
    expect(text).toContain('สร้างภาพ: แมวใส่ชุดนักเรียน / นั่งอ่านหนังสือ')
    expect(text).toContain('สไตล์: ภาพวาดสีน้ำ')
    expect(text).toContain('ใช้สำหรับ: ปกรายงาน (เว้นพื้นที่ว่างด้านบนไว้ใส่ชื่อเรื่องทีหลัง)')
    expect(text).toContain('สัดส่วนภาพ 3:4 (แนวตั้ง)')
    expect(text).not.toContain('อารมณ์ของภาพ') // ไม่ได้เลือก จึงตัดทิ้ง
    expect(text).toContain('ห้ามใส่ตัวหนังสือ')
    expect(countBlanks(text)).toBe(0)
    expect(buildFreeImagePrompt({ ...answers, mood: 'ตลก' }, 'claude')).toMatch(/อารมณ์ของภาพ: ตลก[\s\S]*SVG/)
  })

  it('ตัวเลือกในคำถามตรงกับ images.json', async () => {
    const { imagePurposes, imageStyles, questions } = await import('../data')
    const fields = questions.flatMap((q) => q.fields)
    expect(fields.find((f) => f.id === 'imagePurpose')?.options).toEqual(imagePurposes.map((p) => p.label))
    expect(fields.find((f) => f.id === 'imageStyle')?.options).toEqual(imageStyles.map((s) => s.label))
  })
})
