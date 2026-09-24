export type GoalId = 'intro' | 'm4' | 'tcas' | 'project'

export interface Goal {
  id: GoalId
  emoji: string
  title: string
  description: string
  /** จำนวนหน้าที่แนะนำ ใช้เป็นค่าเริ่มต้นของ pageCount */
  defaultPages: string
  note?: string
}

export type FieldType = 'text' | 'textarea' | 'chips'

/** ข้อความที่เปลี่ยนตามเป้าหมายได้ ใส่ค่า default ไว้ที่ key "default" */
export type ByGoal = Partial<Record<GoalId | 'default', string>>

export interface Field {
  id: string
  label: string | ByGoal
  type: FieldType
  placeholder?: string | ByGoal
  /** ตัวอย่างคำตอบ แสดงใต้ช่อง และกด "ใช้ตัวอย่างนี้" ได้ */
  example?: string | ByGoal
  options?: string[]
  required?: boolean
  /** ถ้ากำหนด จะแสดงเฉพาะเป้าหมายเหล่านี้ */
  goals?: GoalId[]
}

export interface Question {
  id: string
  emoji: string
  title: string | ByGoal
  subtitle: string | ByGoal
  tip?: string
  fields: Field[]
  goals?: GoalId[]
}

export type ToolKind = 'content' | 'design'
export type ToolId = 'chatgpt' | 'claude' | 'gemini' | 'canva' | 'gamma' | 'gslides'

export interface Tool {
  id: ToolId
  emoji: string
  name: string
  kind: ToolKind
  url: string
  blurb: string
  /** วิธีใช้ prompt กับเครื่องมือนี้ ทีละข้อ */
  howTo: string[]
  /** ข้อความเสริมท้าย prompt ให้เหมาะกับเครื่องมือ */
  promptSuffix?: string
}

export type TemplateStage = 'content' | 'design' | 'refine'

export interface PromptTemplate {
  id: string
  title: string
  description: string
  stage: TemplateStage
  goals: GoalId[]
  /** เนื้อหา prompt ใช้ {{fieldId}} แทนคำตอบ ถ้าไม่มีคำตอบจะแสดงเป็น [__] */
  body: string
  /** persona ตัวอย่างที่ใช้แสดงในคลังเทมเพลต */
  sampleId: string
}

export interface Sample {
  id: string
  label: string
  goal: GoalId
  answers: Answers
}

export type Answers = Record<string, string>
