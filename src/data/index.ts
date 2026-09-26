import type { BuddyAction, MoveAction } from '../components/BuddyArt'
import type { ShopItem } from '../lib/game'
import type { BadgeRule } from '../lib/badges'
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
import buddiesJson from './buddies.json'
import shopJson from './shop.json'

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
  id: 'avatar' | 'scene' | 'icons' | 'stickers' | 'background'
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

export type BadgeIconName =
  | 'book' | 'sort' | 'target' | 'eye' | 'fire' | 'repeat'
  | 'pencil' | 'folder' | 'slides' | 'palette' | 'trophy' | 'scroll' | 'crown'
  | 'coins' | 'gem' | 'bag' | 'box' | 'sparkle' | 'heart' | 'wand' | 'rainbow'

export interface Badge {
  id: string
  /** หมวดบนชั้นวางตรา */
  group: string
  name: string
  desc: string
  /** ใช้สีของส่วน RTCF */
  color: RtcfPart
  icon: BadgeIconName
  /** วิธีได้ตรานี้ */
  rule: BadgeRule
}

export const rtcf = rtcfJson as RtcfInfo[]
export const lesson = lessonJson as Lesson
export const badges = badgesJson as unknown as Badge[]

export type BuddyKind = 'cat' | 'bear' | 'bunny' | 'robot' | 'dino' | 'unicorn' | 'dragon' | 'fox'

export interface BuddyInfo {
  id: string
  kind: BuddyKind
  /** ตัวละครพิเศษ: ต้องซื้อด้วยเหรียญ มีรัศมีเรืองแสงและท่าพิเศษ */
  special?: boolean
  price?: number
  /** นิสัยสั้นๆ แสดงในหน้าเลือกผู้ช่วย */
  trait: string
  intro: string
  /** คำลงท้ายประจำตัว ต่อท้ายข้อความให้กำลังใจ */
  ending: string
  /** ขยับเองทุกกี่วินาที [น้อยสุด, มากสุด] ตามนิสัย */
  tempo: [number, number]
  /** ท่าที่ชอบทำตอนว่าง (ซ้ำได้ = ทำบ่อยขึ้น) */
  moves: MoveAction[]
  /** ท่าเมื่อถูกแตะ */
  tap: BuddyAction[]
  /** ประโยคพึมพำสั้นๆ ตอนขยับเอง */
  chatter: string[]
  color: string
  dark: string
  belly: string
}

export interface BuddyLines {
  greetings: string[]
  cheers: string[]
  oops: string[]
  done: string[]
  tips: string[]
}

export const buddies = buddiesJson.buddies as unknown as BuddyInfo[]
export const buddyLines: BuddyLines = buddiesJson

export const shopItems = shopJson as ShopItem[]
