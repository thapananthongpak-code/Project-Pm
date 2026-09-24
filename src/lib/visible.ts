import { questions } from '../data'
import type { Field, GoalId, Question } from '../types'

export function visibleQuestions(goal: GoalId): Question[] {
  return questions.filter((q) => !q.goals || q.goals.includes(goal))
}

export function visibleFields(question: Question, goal: GoalId): Field[] {
  return question.fields.filter((f) => !f.goals || f.goals.includes(goal))
}
