import { describe, expect, it } from 'vitest'
import { templates } from '../data'
import type { Answers } from '../types'
import { BLANK, PASTE_HERE, buildPrompts, buildRefinePrompt, countBlanks, fillTemplate, firstBlankPage, firstIncompletePage } from './promptBuilder'
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
    const { content, design } = buildPrompts('m4', m4, 'gamma')
    expect(countBlanks(content) + countBlanks(design)).toBe(0)
    expect(content).toContain('เพื่อสมัคร ม.4 แผนการเรียนวิทย์-คณิต โรงเรียนสวนกุหลาบวิทยาลัย')
    expect(content).toContain('นักเรียน ม.3')
    expect(content).not.toContain('รางวัล:') // ไม่ได้ตอบ จึงตัดทิ้ง
    expect(design).toContain('สร้างสไลด์พอร์ตโฟลิโอ 10 หน้า')
    expect(design).toContain('โทนสีที่เข้ากับเนื้อหา') // ค่าเริ่มต้นเมื่อไม่ได้เลือก
    expect(design).toContain(PASTE_HERE)
    expect(design).toContain('---') // คำแนะนำเฉพาะ Gamma
  })

  it('สื่อนำเสนอ ใส่วิชาและหัวข้อ', () => {
    const { content, design } = buildPrompts('present', present, 'chatgpt')
    expect(countBlanks(content)).toBe(0)
    expect(content).toContain('วิชา/กิจกรรม: วิทยาศาสตร์')
    expect(content).toContain('เรื่อง: ระบบสุริยะ')
    expect(content).toContain('ภาษาสุภาพ เข้าใจง่าย')
    expect(content).not.toContain('เวลานำเสนอ') // ไม่ได้เลือก จึงตัดทิ้ง
    expect(design).toContain('สร้างสไลด์นำเสนอ 8 หน้า')
  })

  it('เลือกวิชา "อื่นๆ" ใช้ชื่อที่พิมพ์เอง', () => {
    const { content } = buildPrompts('present', { ...present, subject: 'อื่นๆ', subjectOther: 'ชุมนุมหุ่นยนต์' }, 'claude')
    expect(content).toContain('วิชา/กิจกรรม: ชุมนุมหุ่นยนต์')
    expect(content).not.toContain('อื่นๆ')
  })

  it('เลือกเครื่องมือทำสไลด์ ขั้น ก ยังได้คำแนะนำของ AI แชท', () => {
    const { content, contentTool, designTool } = buildPrompts('m4', m4, 'canva')
    expect(contentTool.kind).toBe('content')
    expect(designTool?.id).toBe('canva')
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
