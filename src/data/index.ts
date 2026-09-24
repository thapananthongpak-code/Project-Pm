import type { Goal, PromptTemplate, Question, Tool } from '../types'
import goalsJson from './goals.json'
import questionsJson from './questions.json'
import toolsJson from './tools.json'
import templatesJson from './templates.json'
import refinementsJson from './refinements.json'

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
