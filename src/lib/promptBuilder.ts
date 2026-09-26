import { goals, imagePurposes, imageRefinements, imageStyles, imageSubjects, imageTools, questions, refinements, templates, tools } from '../data'
import type { ImageStyle, ImageSubject, ImageTool } from '../data'
import type { Answers, GoalId, PromptTemplate, Tool, ToolId } from '../types'
import { visibleFields, visibleQuestions } from './visible'

export const BLANK = '[__]'

const PLACEHOLDER = /\{\{(\w+)\}\}/g
const requiredIds = new Set(questions.flatMap((q) => q.fields.filter((f) => f.required).map((f) => f.id)))

/** คำตอบหลายบรรทัดรวมเป็นบรรทัดเดียว ให้ prompt อ่านง่าย */
function clean(value: string | undefined): string {
  return (value ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' / ')
}

export interface FillOptions {
  /** ตัดบรรทัดแบบ "หัวข้อ: {{x}}" ที่ผู้ใช้ไม่ได้ตอบและไม่บังคับทิ้ง (true = ใช้กับผลลัพธ์จริง) */
  dropEmptyOptional?: boolean
}

/** หัวข้อส่วน เช่น "บริบท (Context):" ที่ไม่มีข้อความต่อท้าย */
const SECTION_HEADER = /^[^-\s].*\):\s*$/

/** ตัดหัวข้อส่วนที่ไม่เหลือรายการ "- ..." ข้างใต้ทิ้ง (เช่น ไม่ได้ตอบข้อไหนในส่วนนั้นเลย) */
function dropEmptySections(lines: string[]): string[] {
  return lines.filter((line, i) => !SECTION_HEADER.test(line) || lines[i + 1]?.startsWith('- '))
}

export function fillTemplate(body: string, values: Answers, { dropEmptyOptional = true }: FillOptions = {}): string {
  const lines = body
    .split('\n')
    .flatMap((line) => {
      const ids = [...line.matchAll(PLACEHOLDER)].map((m) => m[1])
      const isLabelLine = ids.length > 0 && line.replace(PLACEHOLDER, '').trim().endsWith(':')
      const allEmptyOptional = ids.every((id) => !clean(values[id]) && !requiredIds.has(id))
      if (dropEmptyOptional && isLabelLine && allEmptyOptional) return []

      let out = line.replace(PLACEHOLDER, (_, id: string) => clean(values[id]) || BLANK)
      // ชื่อเล่นว่าง ไม่ต้องแสดงวงเล็บเปล่า
      if (dropEmptyOptional) out = out.replace(/\s?\(\[__\]\)/g, '')
      return [out]
    })
  return (dropEmptyOptional ? dropEmptySections(lines) : lines).join('\n')
}

/** ช่องบทบาท (R) ของแต่ละหัวข้อ */
const roleField: Record<GoalId, string> = { m4: 'roleM4', present: 'rolePresent', image: 'roleImage' }

/** บทบาทที่เลือก ถ้ายังไม่เลือกใช้ตัวเลือกแรกของหัวข้อนั้น */
export function roleFor(goal: GoalId | null, answers: Answers): string {
  if (!goal) return ''
  const field = questions.flatMap((q) => q.fields).find((f) => f.id === roleField[goal])
  return answers[roleField[goal]]?.trim() || field?.options?.[0] || ''
}

export function audienceFor(goal: GoalId | null): string {
  return goal === 'present' ? 'เพื่อนและครู' : 'กรรมการ'
}

/** ประโยคระดับ/แผนการเรียน ให้อ่านถูกทุกตัวเลือก (เช่น ปวช. ไม่ใช่แผนการเรียน ม.4) */
export function trackPhrase(track: string | undefined): string {
  const t = track?.trim()
  if (!t) return ''
  if (t === 'ยังไม่แน่ใจ') return 'ม.4 (ยังไม่แน่ใจแผนการเรียน)'
  if (t === 'ปวช.') return 'ระดับ ปวช.'
  return `ม.4 แผนการเรียน ${t}`
}

/** รวมคำตอบกับค่าเริ่มต้น และค่าพิเศษที่เทมเพลตใช้ */
export function withDefaults(goal: GoalId | null, answers: Answers): Answers {
  const filled = Object.fromEntries(Object.entries(answers).filter(([, v]) => v?.trim()))
  const info = goals.find((g) => g.id === goal)
  return {
    voice: info?.voice ?? 'เป็นกันเอง จริงใจ',
    pageCount: info?.defaultPages ?? '8',
    slideStyle: 'เรียบง่าย อ่านง่าย',
    colors: 'ที่เข้ากับเนื้อหา',
    ...filled,
    role: roleFor(goal, answers),
    trackPhrase: trackPhrase(filled.track),
    subjectLabel: filled.subject === 'อื่นๆ' ? (filled.subjectOther ?? '') : (filled.subject ?? ''),
    deckType: info?.deckType ?? '',
    photoHint: info?.photoHint ?? '',
    audience: audienceFor(goal),
  }
}

/** เทมเพลตแรกของขั้นนั้นที่ใช้กับหัวข้อนี้ */
export function templateFor(stage: PromptTemplate['stage'], goal: GoalId): PromptTemplate {
  return templates.find((t) => t.stage === stage && t.goals.includes(goal)) ?? templates.find((t) => t.stage === stage)!
}

export function contentTemplateFor(goal: GoalId): PromptTemplate {
  return templateFor('content', goal)
}

export const designTemplate = templates.find((t) => t.stage === 'design')!
export const refineTemplate = templates.find((t) => t.stage === 'refine')!

/** AI ที่เลือก ถ้าไม่มีใช้ตัวแรก */
export function toolById(id: ToolId | null): Tool {
  return tools.find((t) => t.id === id) ?? tools[0]
}

export interface BuiltPrompts {
  /** ขั้นที่ 1: เขียนเนื้อหา (เปิดแชทใหม่) */
  content: string
  /** ขั้นที่ 2: ทำเป็นสไลด์ (วางต่อในแชทเดิม) */
  design: string
  tool: Tool
}

export function buildPrompts(goal: GoalId, answers: Answers, toolId: ToolId | null): BuiltPrompts {
  const tool = toolById(toolId)
  const values = { ...withDefaults(goal, answers), slideSuffix: tool.slideSuffix, answerFormat: tool.promptSuffix }
  return {
    content: fillTemplate(contentTemplateFor(goal).body, values),
    design: fillTemplate(designTemplate.body, values),
    tool,
  }
}

export function buildRefinePrompt(goal: GoalId | null, refinementId: string): string {
  const refinement = refinements.find((r) => r.id === refinementId) ?? refinements[0]
  return fillTemplate(refineTemplate.body, { audience: audienceFor(goal), refineMode: refinement.refineMode })
}

/** คำตอบหลายบรรทัด แยกเป็นรายการ */
function lines(value: string | undefined): string[] {
  return (value ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** เรื่องราวในรูป ดึงจากคำตอบที่มีอยู่แล้ว ผู้ใช้ไม่ต้องกรอกเพิ่ม */
function imageTheme(goal: GoalId, values: Answers, subject: ImageSubject): string {
  if (subject.id === 'icons') {
    const items =
      goal === 'm4' ? ['ข้อมูลส่วนตัว', 'จุดเด่น', 'ผลงาน', 'รางวัล', 'เป้าหมายการเรียน'] : lines(values.keyPoints).slice(0, 6)
    return items.length ? `ไอคอนละ 1 เรื่อง: ${items.join(', ')}` : ''
  }
  if (goal === 'present') {
    return [values.subjectLabel, values.topic && `เรื่อง ${values.topic}`].filter(Boolean).join(' ')
  }
  const strength = lines(values.strengths)[0]
  const track = values.track && values.track !== 'ยังไม่แน่ใจ' ? trackPhrase(values.track) : ''
  return [strength && `ท่าทางที่แสดงความสามารถ: ${strength}`, track && `กำลังจะเรียนต่อ ${track}`]
    .filter(Boolean)
    .join(' และ')
}

export interface ImageChoice {
  subject: ImageSubject
  style: ImageStyle
  tool: ImageTool
}

/** ตัวเลือกรูปที่ผู้ใช้เลือกไว้ (เก็บในคำตอบ) หรือค่าเริ่มต้น */
export function imageChoice(goal: GoalId, answers: Answers, toolId: ToolId | null): ImageChoice {
  return {
    subject:
      imageSubjects.find((s) => s.label === answers.imageSubject) ??
      imageSubjects.find((s) => s.id === (goal === 'm4' ? 'avatar' : 'scene'))!,
    style: imageStyles.find((s) => s.label === answers.imageStyle) ?? imageStyles[0],
    tool: imageTools.find((t) => t.id === toolId) ?? imageTools[0],
  }
}

export function buildImagePrompt(goal: GoalId, answers: Answers, toolId: ToolId | null): string {
  const { subject, style, tool } = imageChoice(goal, answers, toolId)
  const values = withDefaults(goal, answers)
  const look = answers.imageLook?.trim()
  return fillTemplate(templateFor('image', goal).body, {
    ...values,
    imageToolSuffix: tool.suffix,
    imageSubjectDesc: subject.desc,
    imageStyleDesc: style.desc,
    imageCharacter: subject.character
      ? `นักเรียนไทย ม.3 ใส่ชุดนักเรียน${look ? ` ${look}` : ''} ยิ้มแย้ม ดูเป็นมิตร`
      : '',
    imageTheme: imageTheme(goal, values, subject),
    imageRatio: subject.ratio,
  })
}

/** หัวข้อ "สร้างภาพ": ภาพตามที่นักเรียนบรรยาย */
export function buildFreeImagePrompt(answers: Answers, toolId: ToolId | null): string {
  const style = imageStyles.find((s) => s.label === answers.imageStyle)
  const purpose = imagePurposes.find((p) => p.label === answers.imagePurpose)
  const tool = imageTools.find((t) => t.id === toolId) ?? imageTools[0]
  return fillTemplate(templateFor('image', 'image').body, {
    ...withDefaults('image', answers),
    imageToolSuffix: tool.suffix,
    imageStyleDesc: style?.desc ?? '',
    imagePurposeExtra: purpose?.extra ?? '',
    imageRatio: purpose?.ratio ?? '',
  })
}

export function buildImageRefinePrompt(refinementId: string): string {
  return (imageRefinements.find((r) => r.id === refinementId) ?? imageRefinements[0]).text
}

export function countBlanks(text: string): number {
  return text.split(BLANK).length - 1
}

/** หน้าคำถามแรกที่มีช่องซึ่งกลายเป็น [__] ใน prompt (-1 ถ้าไม่มี) */
export function firstBlankPage(goal: GoalId, answers: Answers): number {
  const blanksWith = (a: Answers) => {
    const { content, design } = buildPrompts(goal, a, null)
    return countBlanks(content) + countBlanks(design)
  }
  const current = blanksWith(answers)
  if (current === 0) return -1
  // ช่องที่ถ้ากรอกแล้ว [__] ลดลง คือช่องที่ยังขาดจริง
  const isBlank = (id: string) => !answers[id]?.trim() && blanksWith({ ...answers, [id]: 'x' }) < current
  return visibleQuestions(goal).findIndex((q) => visibleFields(q, goal, answers).some((f) => isBlank(f.id)))
}

/** หน้าคำถามแรกที่ยังมีช่องบังคับว่างอยู่ (-1 ถ้าครบ) */
export function firstIncompletePage(goal: GoalId, answers: Answers): number {
  return visibleQuestions(goal).findIndex((q) =>
    visibleFields(q, goal, answers).some((f) => f.required && !answers[f.id]?.trim()),
  )
}
