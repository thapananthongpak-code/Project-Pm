import { describe, expect, it } from 'vitest'
import { templates } from '../data'
import type { Answers } from '../types'
import { BLANK, buildPrompts, countBlanks, fillTemplate, firstBlankPage, firstIncompletePage } from './promptBuilder'
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
    const { content } = buildPrompts('m4', m4, 'chatgpt')
    expect(countBlanks(content)).toBe(0)
    expect(content).toContain('เพื่อสมัครเรียนต่อ ม.4 แผนการเรียน วิทย์-คณิต ที่โรงเรียนสวนกุหลาบวิทยาลัย')
    expect(content).toContain('นักเรียน ม.3')
    expect(content).not.toContain('รางวัล:') // ไม่ได้ตอบ จึงตัดทิ้ง
    expect(content).toContain('ช่วยวางโครงพอร์ตโฟลิโอ 10 หน้า')
    expect(content).toContain('- หน้าตาสไลด์: สไตล์เรียบง่าย อ่านง่าย โทนสีที่เข้ากับเนื้อหา') // ค่าเริ่มต้นเมื่อไม่ได้เลือก
    expect(content).toContain('ให้เสนอว่าจะสร้างเป็นไฟล์ PowerPoint (.pptx)')
  })

  it('สื่อนำเสนอ ใส่วิชาและหัวข้อ', () => {
    const { content } = buildPrompts('present', { ...present, slideStyle: 'มินิมอล', colors: 'ฟ้า-ขาว' }, 'chatgpt')
    expect(countBlanks(content)).toBe(0)
    expect(content).toContain('- วิชา/กิจกรรม: วิทยาศาสตร์')
    expect(content).toContain('เรื่อง "ระบบสุริยะ"')
    expect(content).toContain('ภาษาสุภาพ เข้าใจง่าย')
    expect(content).not.toContain('เวลานำเสนอ') // ไม่ได้เลือก จึงตัดทิ้ง
    expect(content).toContain('ช่วยเขียนเนื้อหาสไลด์ 8 หน้า')
    expect(content).toContain('- หน้าตาสไลด์: สไตล์มินิมอล โทนสีฟ้า-ขาว')
  })

  it('เลือกวิชา "อื่นๆ" ใช้ชื่อที่พิมพ์เอง', () => {
    const { content } = buildPrompts('present', { ...present, subject: 'อื่นๆ', subjectOther: 'ชุมนุมหุ่นยนต์' }, 'claude')
    expect(content).toContain('วิชา/กิจกรรม: ชุมนุมหุ่นยนต์')
    expect(content).not.toContain('อื่นๆ')
  })

  it('วิธีส่งออกสไลด์ปรับตาม AI ที่เลือก', () => {
    expect(buildPrompts('m4', m4, 'gemini').content).toContain('Canvas')
    expect(buildPrompts('m4', m4, 'claude').content).toContain('.pptx')
    const { content, tool } = buildPrompts('m4', m4, null)
    expect(tool.id).toBe('chatgpt') // ไม่ได้เลือก ใช้ตัวแรก
    expect(content).toContain('สไลด์ที่ 1, 2, 3')
  })
})

describe('หน้าคำถาม', () => {
  it('ช่อง "ระบุวิชา" แสดงเฉพาะเมื่อเลือก "อื่นๆ"', () => {
    const q = visibleQuestions('present').find((x) => x.id === 'subject')!
    expect(visibleFields(q, 'present', { subject: 'ศิลปะ' }).map((f) => f.id)).not.toContain('subjectOther')
    expect(visibleFields(q, 'present', { subject: 'อื่นๆ' }).map((f) => f.id)).toContain('subjectOther')
  })

  it('ชี้หน้าแรกที่ช่องบังคับยังว่าง', () => {
    expect(firstIncompletePage('m4', {})).toBe(0)
    expect(firstIncompletePage('m4', { ...m4, roleM4: 'ที่ปรึกษาการทำพอร์ตโฟลิโอสำหรับนักเรียนไทย' })).toBe(-1)
    // หน้าแรกคือเลือกบทบาท (R) ถัดมาคือวิชา
    expect(firstIncompletePage('present', { ...present, rolePresent: 'ครูที่สอนวิชานี้ให้เข้าใจง่าย', subject: 'อื่นๆ' })).toBe(1)
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
  it('ทุกเป้าหมายมีเทมเพลตเนื้อหา', () => {
    for (const goal of ['m4', 'present'] as const) {
      expect(templates.some((t) => t.stage === 'content' && t.goals.includes(goal))).toBe(true)
    }
  })
})

describe('หัวข้อสร้างภาพ', () => {
  const answers: Answers = {
    imageDesc: 'แมวใส่ชุดนักเรียน\nนั่งอ่านหนังสือ',
    imagePurpose: 'ปกรายงาน',
    imageStyle: 'สีน้ำ',
  }

  it('มีคำถาม 4 หน้า เรียง R → T → C → F ไม่ถามชื่อหรือจำนวนหน้า', () => {
    expect(visibleQuestions('image').map((q) => q.id)).toEqual(['role', 'imageWhat', 'imageUse', 'imageStyle'])
  })

  it('สร้าง prompt จากคำบรรยาย การใช้งาน และสไตล์', async () => {
    const { buildFreeImagePrompt } = await import('./promptBuilder')
    const text = buildFreeImagePrompt(answers, 'chatgpt')
    expect(text).toContain('บทบาท (Role): คุณคือนักวาดภาพประกอบการ์ตูน') // ยังไม่เลือก ใช้บทบาทแรก
    expect(text).toContain('งาน (Task): สร้างภาพ แมวใส่ชุดนักเรียน / นั่งอ่านหนังสือ')
    expect(text).toContain('- สไตล์: ภาพวาดสีน้ำ')
    expect(text).toContain('- ใช้สำหรับ: ปกรายงาน (เว้นพื้นที่ว่างด้านบนไว้ใส่ชื่อเรื่องทีหลัง)')
    expect(text).not.toContain('คนดูภาพ') // ไม่ได้เลือก จึงตัดทิ้ง
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

describe('โครงสร้าง RTCF', () => {
  it('prompt ทุกแบบมีครบ 4 ส่วน และเรียง R → T → C → F', async () => {
    const { buildFreeImagePrompt } = await import('./promptBuilder')
    const { splitSections } = await import('./rtcf')
    const texts = [
      buildPrompts('m4', m4, 'chatgpt').content,
      buildPrompts('present', present, 'gemini').content,
      buildFreeImagePrompt({ imageDesc: 'แมว', imagePurpose: 'สไลด์', imageStyle: 'อนิเมะ' }, 'chatgpt'),
    ]
    for (const t of texts) {
      expect(splitSections(t).map((sec) => sec.part)).toEqual(['R', 'T', 'C', 'F'])
    }
  })

  it('ใช้บทบาทที่นักเรียนเลือก', () => {
    const { content } = buildPrompts('present', { ...present, rolePresent: 'ยูทูบเบอร์สายความรู้ที่เล่าเรื่องสนุก' }, 'chatgpt')
    expect(content.split('\n')[0]).toBe('บทบาท (Role): คุณคือยูทูบเบอร์สายความรู้ที่เล่าเรื่องสนุก')
  })

  it('ตัดหัวข้อส่วนที่ไม่มีรายการเหลือทิ้ง', () => {
    expect(fillTemplate('บริบท (Context):\n- รางวัล: {{awards}}\nรูปแบบ (Format):\n- สั้นๆ', {})).toBe('รูปแบบ (Format):\n- สั้นๆ')
  })

  it('ทุกหน้าคำถามบอกส่วน RTCF และแต่ละหัวข้อเริ่มด้วยบทบาท (R)', async () => {
    const { questions } = await import('../data')
    for (const q of questions) expect(['R', 'T', 'C', 'F']).toContain(q.part)
    for (const goal of ['m4', 'present', 'image'] as const) {
      const parts = visibleQuestions(goal).map((q) => q.part)
      expect(parts[0], goal).toBe('R')
      expect(new Set(parts), goal).toEqual(new Set(['R', 'T', 'C', 'F']))
    }
  })
})

describe('ตัวเลือกในภารกิจ', () => {
  it('มีตัวเลือกให้เลือกเยอะในทุกภารกิจ', async () => {
    const { questions, imageStyles } = await import('../data')
    const f = (id: string) => questions.flatMap((q) => q.fields).find((x) => x.id === id)!
    for (const id of ['roleM4', 'rolePresent', 'roleImage']) expect(f(id).options!.length, id).toBeGreaterThanOrEqual(7)
    for (const id of ['slideStyle', 'colors', 'track', 'subject']) expect(f(id).options!.length, id).toBeGreaterThanOrEqual(10)
    for (const id of ['strengths', 'works', 'keyPoints', 'imageDesc']) expect(f(id).suggestions!.length, id).toBeGreaterThanOrEqual(10)
    expect(imageStyles.length).toBeGreaterThanOrEqual(12)
  })

  it('ไม่มีตัวเลือกซ้ำในช่องเดียวกัน', async () => {
    const { questions } = await import('../data')
    for (const field of questions.flatMap((q) => q.fields)) {
      for (const list of [field.options, field.suggestions]) {
        if (list) expect(new Set(list).size, field.id).toBe(list.length)
      }
    }
  })
})

describe('ประโยคแผนการเรียน', () => {
  it('อ่านถูกทุกตัวเลือก รวมยังไม่แน่ใจ และค่าเก่าที่ถูกเอาออกแล้ว', async () => {
    const { trackPhrase, buildPrompts } = await import('./promptBuilder')
    expect(trackPhrase('วิทย์-คณิต')).toBe('ม.4 แผนการเรียน วิทย์-คณิต')
    expect(trackPhrase('ยังไม่แน่ใจ')).toBe('ม.4 (ยังไม่ได้เลือกแผนการเรียน)')
    expect(trackPhrase('ปวช.')).toBe('ม.4')
    const content = buildPrompts('m4', { ...m4, track: 'ปวช.' }, 'chatgpt').content
    expect(content).toContain('เพื่อสมัครเรียนต่อ ม.4 ที่')
    expect(content).not.toContain('ปวช')
  })
})
