import type { Goal, PromptTemplate, Question, RtcfPart, Tool, ToolId } from '../types'
import goalsJson from './goals.json'
import questionsJson from './questions.json'
import toolsJson from './tools.json'
import templatesJson from './templates.json'
import refinementsJson from './refinements.json'
import imagesJson from './images.json'
import rtcfJson from './rtcf.json'
import lessonJson from './lesson.json'
import badgesJson from './badges.json'

export interface Refinement {
  id: string
  label: string
  refineMode: string
}

export const goals = goalsJson as Goal[]
export const questions = questionsJson as Question[]
export const tools = toolsJson as Tool[]
export const templates = templatesJson as PromptTemplate[]
export const refinements = refinementsJson as Refinement[]

export interface ImageSubject {
  id: 'avatar' | 'scene' | 'icons'
  label: string
  desc: string
  ratio: string
  /** มีตัวละครนักเรียนในรูปไหม */
  character: boolean
}

export interface ImageStyle {
  label: string
  desc: string
}

export interface ImageTool {
  id: ToolId
  suffix: string
  note?: string
  /** ข้อความสั้นใต้ชื่อ AI ในหน้าเลือก AI ของหัวข้อสร้างภาพ */
  short?: string
}

export interface ImagePurpose {
  label: string
  ratio: string
  extra: string
}

export interface ImageRefinement {
  id: string
  label: string
  text: string
}

export const imageSubjects = imagesJson.subjects as ImageSubject[]
export const imageStyles = imagesJson.styles as ImageStyle[]
export const imageTools = imagesJson.tools as ImageTool[]
export const imagePurposes = imagesJson.purposes as ImagePurpose[]
export const imageRefinements = imagesJson.refinements as ImageRefinement[]

export interface RtcfInfo {
  id: RtcfPart
  en: string
  th: string
  /** คำถามที่นักเรียนถามตัวเองเพื่อเขียนส่วนนี้ */
  ask: string
  desc: string
  starter: string
  examples: string[]
  tip: string
}

export type SlideKind = 'cover' | 'compare' | 'part' | 'assemble' | 'tips' | 'quiz-sort' | 'quiz-pick' | 'end'

export interface Lesson {
  slides: { id: string; kind: SlideKind; part?: RtcfPart }[]
  compare: { bad: string; badNote: string; goodNote: string }
  assemble: { part: RtcfPart; text: string }[]
  tips: { title: string; text: string }[]
  /** เกมแยกประเภท: ประโยคนี้เป็นส่วนไหน */
  sort: { text: string; answer: RtcfPart }[]
  /** เกมเลือก prompt ที่ดีกว่า */
  pick: { options: [string, string]; better: 0 | 1; why: string }[]
}

export interface Badge {
  id: string
  name: string
  desc: string
  /** ใช้สีของส่วน RTCF */
  color: RtcfPart
}

export const rtcf = rtcfJson as RtcfInfo[]
export const lesson = lessonJson as Lesson
export const badges = badgesJson as Badge[]
