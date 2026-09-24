import { goals, questions, refinements, templates, tools } from '../data'
import type { Answers, GoalId, PromptTemplate, Tool, ToolId } from '../types'
import { visibleQuestions } from './visible'

export const BLANK = '[__]'
export const PASTE_HERE = '[วางเนื้อหาที่ได้จาก Prompt ขั้น ก ตรงนี้]'

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

export function fillTemplate(body: string, values: Answers, { dropEmptyOptional = true }: FillOptions = {}): string {
  return body
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
    .join('\n')
}

export function audienceFor(goal: GoalId | null): string {
  if (goal === 'intro') return 'เพื่อนและครู'
  if (goal === 'project') return 'กรรมการและผู้ฟัง'
  return 'กรรมการ'
}

/** รวมคำตอบกับค่าเริ่มต้น และค่าพิเศษที่เทมเพลตใช้ */
export function withDefaults(goal: GoalId | null, answers: Answers): Answers {
  const filled = Object.fromEntries(Object.entries(answers).filter(([, v]) => v?.trim()))
  return {
    voice: 'เป็นกันเอง จริงใจ',
    pageCount: goals.find((g) => g.id === goal)?.defaultPages ?? '8',
    ...filled,
    audience: audienceFor(goal),
    content: PASTE_HERE,
  }
}

export function contentTemplateFor(goal: GoalId): PromptTemplate {
  return templates.find((t) => t.stage === 'content' && t.goals.includes(goal)) ?? templates[0]
}

export const designTemplate = templates.find((t) => t.stage === 'design')!
export const refineTemplate = templates.find((t) => t.stage === 'refine')!

export function toolById(id: ToolId | null): Tool | undefined {
  return tools.find((t) => t.id === id)
}

export interface BuiltPrompts {
  content: string
  design: string
  contentTool: Tool
  designTool: Tool | undefined
}

export function buildPrompts(goal: GoalId, answers: Answers, toolId: ToolId | null): BuiltPrompts {
  const values = withDefaults(goal, answers)
  const picked = toolById(toolId)
  const contentTool = picked?.kind === 'content' ? picked : tools.find((t) => t.kind === 'content')!
  const designTool = picked?.kind === 'design' ? picked : undefined

  const withSuffix = (text: string, tool?: Tool) => (tool?.promptSuffix ? `${text}\n${tool.promptSuffix}` : text)

  return {
    content: withSuffix(fillTemplate(contentTemplateFor(goal).body, values), contentTool),
    design: withSuffix(fillTemplate(designTemplate.body, values), designTool),
    contentTool,
    designTool,
  }
}

export function buildRefinePrompt(goal: GoalId | null, refinementId: string): string {
  const refinement = refinements.find((r) => r.id === refinementId) ?? refinements[0]
  return fillTemplate(refineTemplate.body, { audience: audienceFor(goal), refineMode: refinement.refineMode })
}

/** ตัวอย่างเทมเพลตสำหรับคลังเทมเพลต: เติมด้วย persona ตัวอย่าง หรือแบบเปล่า */
export function previewTemplate(template: PromptTemplate, answers: Answers | null, goal: GoalId | null): string {
  if (template.stage === 'refine') {
    return answers
      ? buildRefinePrompt(goal, refinements[0].id)
      : fillTemplate(
          template.body,
          { refineMode: `[${refinements.map((r) => r.label).join(' / ')}]`, audience: 'กรรมการ' },
          { dropEmptyOptional: false },
        )
  }
  if (!answers) return fillTemplate(template.body, { content: PASTE_HERE }, { dropEmptyOptional: false })
  return fillTemplate(template.body, withDefaults(goal, answers))
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
  return visibleQuestions(goal).findIndex((q) =>
    q.fields.some((f) => (!f.goals || f.goals.includes(goal)) && isBlank(f.id)),
  )
}

/** หน้าคำถามแรกที่ยังมีช่องบังคับว่างอยู่ (-1 ถ้าครบ) */
export function firstIncompletePage(goal: GoalId, answers: Answers): number {
  return visibleQuestions(goal).findIndex((q) =>
    q.fields.some((f) => f.required && (!f.goals || f.goals.includes(goal)) && !answers[f.id]?.trim()),
  )
}
