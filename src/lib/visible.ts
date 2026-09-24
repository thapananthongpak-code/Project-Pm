import { questions } from '../data'
import type { Answers, Field, GoalId, Question } from '../types'

export function visibleQuestions(goal: GoalId): Question[] {
  return questions.filter((q) => !q.goals || q.goals.includes(goal))
}

export function visibleFields(question: Question, goal: GoalId, answers: Answers): Field[] {
  return question.fields.filter(
    (f) => (!f.goals || f.goals.includes(goal)) && (!f.showIf || answers[f.showIf.field] === f.showIf.equals),
  )
}
