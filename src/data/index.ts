import type { Goal, GoalId, PromptTemplate, Question, Sample, Tool } from '../types'
import goalsJson from './goals.json'
import questionsJson from './questions.json'
import toolsJson from './tools.json'
import templatesJson from './templates.json'
import refinementsJson from './refinements.json'
import samplesJson from './samples.json'
import checklistJson from './checklist.json'

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
export const samples = samplesJson as unknown as Sample[]

export interface ChecklistItem {
  id: string
  label: string
  /** ถ้าคำตอบเหล่านี้มีครบ จะแสดงป้าย "กรอกแล้ว" */
  autoFields?: string[]
  goals?: GoalId[]
}

export interface ChecklistGroup {
  id: string
  title: string
  emoji: string
  items: ChecklistItem[]
}

export const checklist = checklistJson as ChecklistGroup[]
