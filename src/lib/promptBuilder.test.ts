import { describe, expect, it } from 'vitest'
import { samples, templates } from '../data'
import { BLANK, PASTE_HERE, buildPrompts, buildRefinePrompt, countBlanks, fillTemplate, firstIncompletePage } from './promptBuilder'

const tcas = samples.find((s) => s.id === 'sample-tcas')!

describe('fillTemplate', () => {
  it('แทนคำตอบ และใส่ [__] ในช่องบังคับที่ว่าง', () => {
    const out = fillTemplate('ชื่อ: {{fullName}}\nเป้าหมาย {{target}}', { fullName: 'ภูมิ' })
    expect(out).toBe(`ชื่อ: ภูมิ\nเป้าหมาย ${BLANK}`)
  })

  it('ตัดบรรทัด "หัวข้อ: {{x}}" ที่ไม่บังคับและว่างทิ้ง', () => {
    const out = fillTemplate('- ชื่อ: {{fullName}}\n- รางวัล: {{awards}}', { fullName: 'ภูมิ' })
    expect(out).toBe('- ชื่อ: ภูมิ')
  })

  it('แบบเปล่าเก็บทุกบรรทัดไว้เป็น [__]', () => {
    const out = fillTemplate('- รางวัล: {{awards}}', {}, { dropEmptyOptional: false })
    expect(out).toBe(`- รางวัล: ${BLANK}`)
  })

  it('รวมคำตอบหลายบรรทัดเป็นบรรทัดเดียว และไม่แสดงวงเล็บชื่อเล่นว่าง', () => {
    const out = fillTemplate('{{fullName}} ({{nickname}}) เก่ง {{strengths}}', { fullName: 'ภูมิ', strengths: 'a\n\n b ' })
    expect(out).toBe('ภูมิ เก่ง a / b')
  })
})

describe('buildPrompts', () => {
  it('ข้อมูลตัวอย่าง TCAS ไม่มีช่องว่างเหลือ และใส่ข้อมูลครบ', () => {
    const { content, design } = buildPrompts('tcas', tcas.answers, 'gamma')
    expect(countBlanks(content)).toBe(0)
    expect(countBlanks(design)).toBe(0)
    expect(content).toContain('วิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยเกษตรศาสตร์')
    expect(content).toContain('เกรดเฉลี่ย: 3.52')
    expect(content).toContain('ให้ถามฉันก่อนเขียนต่อ')
    expect(design).toContain(PASTE_HERE)
    expect(design).toContain('---') // คำแนะนำเฉพาะ Gamma
  })

  it('เลือกเครื่องมือเจนสไลด์ ขั้น ก ยังได้คำแนะนำของ AI แชท', () => {
    const { content, contentTool, designTool } = buildPrompts('tcas', tcas.answers, 'canva')
    expect(contentTool.kind).toBe('content')
    expect(designTool?.id).toBe('canva')
    expect(content).toContain('สไลด์ที่ 1, 2, 3')
  })

  it('เลือกเป้าหมายแล้วใช้เทมเพลตเนื้อหาที่ตรงกัน', () => {
    expect(buildPrompts('intro', {}, 'claude').content).toContain('สไลด์แนะนำตัว')
    expect(buildPrompts('m4', {}, 'claude').content).toContain('วางโครงพอร์ตโฟลิโอ')
    expect(buildPrompts('project', {}, 'claude').content).toContain('นำเสนอโครงงาน')
  })

  it('ใช้จำนวนหน้าและน้ำเสียงเริ่มต้นเมื่อผู้ใช้ไม่ได้เลือก', () => {
    const { content } = buildPrompts('intro', { fullName: 'ข้าวหอม' }, 'chatgpt')
    expect(content).toContain('6 หน้า')
    expect(content).toContain('ภาษาเป็นกันเอง จริงใจ')
  })
})

describe('buildRefinePrompt', () => {
  it('ใช้ข้อความต่อยอดและผู้ฟังตามเป้าหมาย', () => {
    expect(buildRefinePrompt('tcas', 'shorter')).toBe(
      'ปรับเนื้อหาข้างต้นให้สั้นลง 30% โดยเก็บตัวเลขและผลลัพธ์สำคัญไว้ครบ\nและเพิ่มประโยคเปิดที่ทำให้กรรมการจำฉันได้',
    )
    expect(buildRefinePrompt('intro', 'shorter')).toContain('เพื่อนและครู')
  })
})

describe('firstIncompletePage', () => {
  it('ชี้หน้าแรกที่ช่องบังคับยังว่าง', () => {
    expect(firstIncompletePage('tcas', {})).toBe(0)
    expect(firstIncompletePage('tcas', tcas.answers)).toBe(-1)
  })
})

describe('templates.json', () => {
  it('มีเทมเพลตอย่างน้อย 4 แบบ และทุกเป้าหมายมีเทมเพลตเนื้อหา', () => {
    expect(templates.length).toBeGreaterThanOrEqual(4)
    for (const goal of ['intro', 'm4', 'tcas', 'project'] as const) {
      expect(templates.some((t) => t.stage === 'content' && t.goals.includes(goal))).toBe(true)
    }
  })

  it('ข้อมูลตัวอย่างทุกชุดสร้าง prompt ได้ครบไม่มีช่องว่าง', () => {
    for (const s of samples) {
      const { content } = buildPrompts(s.goal, s.answers, 'chatgpt')
      expect(countBlanks(content), s.id).toBe(0)
    }
  })
})

describe('firstBlankPage', () => {
  it('ชี้หน้าที่มีช่องซึ่งกลายเป็น [__] ใน prompt', async () => {
    const { firstBlankPage } = await import('./promptBuilder')
    const { visibleQuestions } = await import('./visible')
    const answers = { ...tcas.answers, colors: '' }
    const idx = firstBlankPage('tcas', answers)
    expect(visibleQuestions('tcas')[idx].id).toBe('style')
    expect(firstBlankPage('tcas', tcas.answers)).toBe(-1)
  })
})

describe('firstBlankPage ข้ามช่องไม่บังคับที่ถูกตัดทิ้ง', () => {
  it('รางวัลว่างไม่ใช่ช่องว่าง แต่โทนสีว่างคือช่องว่าง', async () => {
    const { firstBlankPage } = await import('./promptBuilder')
    const { visibleQuestions } = await import('./visible')
    const idx = firstBlankPage('tcas', { ...tcas.answers, awards: '', colors: '' })
    expect(visibleQuestions('tcas')[idx].id).toBe('style')
  })
})
