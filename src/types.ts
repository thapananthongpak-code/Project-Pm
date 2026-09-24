export type GoalId = 'm4' | 'present'

export interface Goal {
  id: GoalId
  title: string
  description: string
  /** จำนวนหน้าที่แนะนำ ใช้เป็นค่าเริ่มต้นของ pageCount */
  defaultPages: string
  /** น้ำเสียงของเนื้อหา */
  voice: string
  /** ชนิดสไลด์ที่ใช้ใน prompt ทำสไลด์ เช่น "พอร์ตโฟลิโอ" */
  deckType: string
  /** รูปที่ควรเว้นที่ไว้ เช่น "ผลงานจริง" */
  photoHint: string
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
  /** ตัวอย่างคำตอบ กด "ดูตัวอย่าง" แล้วเลือกใช้ได้ */
  example?: string | ByGoal
  options?: string[]
  required?: boolean
  /** ถ้ากำหนด จะแสดงเฉพาะเป้าหมายเหล่านี้ */
  goals?: GoalId[]
  /** แสดงเมื่อช่องอื่นมีค่าตามที่กำหนด เช่น เลือก "อื่นๆ" */
  showIf?: { field: string; equals: string }
}

export interface Question {
  id: string
  title: string | ByGoal
  subtitle: string | ByGoal
  fields: Field[]
  goals?: GoalId[]
}

export type ToolId = 'chatgpt' | 'gemini' | 'claude'

export interface Tool {
  id: ToolId
  name: string
  /** ลิงก์เปิดแชทใหม่ */
  url: string
  blurb: string
  /** ข้อความท้าย prompt ขั้นเขียนเนื้อหา */
  promptSuffix: string
  /** ข้อความท้าย prompt ขั้นทำสไลด์ บอกว่า AI ตัวนี้ส่งสไลด์ออกมาแบบไหน */
  slideSuffix: string
}

export type TemplateStage = 'content' | 'design' | 'image' | 'refine'

export interface PromptTemplate {
  id: string
  title: string
  description: string
  stage: TemplateStage
  goals: GoalId[]
  /** เนื้อหา prompt ใช้ {{fieldId}} แทนคำตอบ ถ้าไม่มีคำตอบจะแสดงเป็น [__] */
  body: string
}

export type Answers = Record<string, string>
