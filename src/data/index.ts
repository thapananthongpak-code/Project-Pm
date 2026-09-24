import type { Goal, PromptTemplate, Question, Tool, ToolId } from '../types'
import goalsJson from './goals.json'
import questionsJson from './questions.json'
import toolsJson from './tools.json'
import templatesJson from './templates.json'
import refinementsJson from './refinements.json'
import imagesJson from './images.json'

export interface Refinement {
  id: string
  emoji: string
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
  id: Extract<ToolId, 'chatgpt' | 'gemini' | 'claude'>
  suffix: string
  note?: string
}

export const imageSubjects = imagesJson.subjects as ImageSubject[]
export const imageStyles = imagesJson.styles as ImageStyle[]
export const imageTools = imagesJson.tools as ImageTool[]
