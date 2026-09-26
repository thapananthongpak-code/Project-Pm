export type GoalId = 'm4' | 'present' | 'image'

/** 4 ส่วนของ prompt ที่ดี: Role, Task, Context, Format */
export type RtcfPart = 'R' | 'T' | 'C' | 'F'

export interface Goal {
  id: GoalId
  title: string
  description: string
  /** ค่าด้านล่างใช้กับหัวข้อที่ทำสไลด์ (หัวข้อสร้างภาพไม่มี) */
  /** จำนวนหน้าที่แนะนำ ใช้เป็นค่าเริ่มต้นของ pageCount */
  defaultPages?: string
  /** น้ำเสียงของเนื้อหา */
  voice?: string
  /** ชนิดสไลด์ที่ใช้ใน prompt ทำสไลด์ เช่น "พอร์ตโฟลิโอ" */
  deckType?: string
  /** รูปที่ควรเว้นที่ไว้ เช่น "ผลงานจริง" */
  photoHint?: string
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
  /** ตัวเลือกด่วนใต้ช่องพิมพ์ แตะเพื่อเพิ่ม/เอาออก */
  suggestions?: string[]
  /** ตัวเลือกด่วนต่อกันแบบขึ้นบรรทัดใหม่ (ค่าเริ่มต้น) หรือคั่นด้วยจุลภาค */
  join?: 'line' | 'comma'
  required?: boolean
  /** ถ้ากำหนด จะแสดงเฉพาะเป้าหมายเหล่านี้ */
  goals?: GoalId[]
  /** แสดงเมื่อช่องอื่นมีค่าตามที่กำหนด เช่น เลือก "อื่นๆ" */
  showIf?: { field: string; equals: string }
}

export interface Question {
  id: string
  /** หน้านี้เติมส่วนไหนของ RTCF */
  part: RtcfPart
  title: string | ByGoal
  subtitle: string | ByGoal
  /** มาสคอตอธิบายว่าทำไมต้องใส่ข้อมูลหน้านี้ */
  why: string | ByGoal
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
