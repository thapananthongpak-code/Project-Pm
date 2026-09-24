import { useCallback } from 'react'
import { goals, tools } from '../data'
import type { Answers, GoalId, Sample, ToolId } from '../types'
import { useLocalStorage } from './useLocalStorage'

export type Step = 0 | 1 | 2 | 3

export interface WizardState {
  step: Step
  /** หน้าคำถามปัจจุบันในขั้นที่ 2 */
  page: number
  goal: GoalId | null
  answers: Answers
  toolId: ToolId | null
}

const initial: WizardState = { step: 0, page: 0, goal: null, answers: {}, toolId: null }

function revive(raw: unknown): WizardState {
  if (!raw || typeof raw !== 'object') return initial
  const r = raw as Partial<WizardState>
  const goal = goals.some((g) => g.id === r.goal) ? (r.goal as GoalId) : null
  const toolId = tools.some((t) => t.id === r.toolId) ? (r.toolId as ToolId) : null
  const answers =
    r.answers && typeof r.answers === 'object'
      ? Object.fromEntries(Object.entries(r.answers).filter(([, v]) => typeof v === 'string'))
      : {}
  let step = ([0, 1, 2, 3] as const).find((s) => s === r.step) ?? 0
  if (!goal) step = 0
  if (step === 3 && !toolId) step = 2
  return { step, page: typeof r.page === 'number' && r.page >= 0 ? r.page : 0, goal, answers, toolId }
}

function defaultPages(goal: GoalId | null) {
  return goals.find((g) => g.id === goal)?.defaultPages
}

export function useWizard() {
  const [state, setState] = useLocalStorage<WizardState>('promptfolio:wizard:v1', initial, revive)

  const selectGoal = useCallback(
    (goal: GoalId) =>
      setState((s) => {
        // เปลี่ยนจำนวนหน้าตามเป้าหมายใหม่ ถ้าผู้ใช้ยังไม่ได้เลือกเอง
        const keepPages = s.answers.pageCount && s.answers.pageCount !== defaultPages(s.goal)
        const answers = keepPages ? s.answers : { ...s.answers, pageCount: defaultPages(goal) ?? '' }
        return { ...s, goal, answers, step: 1, page: 0 }
      }),
    [setState],
  )

  const setAnswer = useCallback(
    (id: string, value: string) => setState((s) => ({ ...s, answers: { ...s.answers, [id]: value } })),
    [setState],
  )

  const goTo = useCallback(
    (step: Step, page?: number) => setState((s) => ({ ...s, step, page: page ?? s.page })),
    [setState],
  )

  const selectTool = useCallback((toolId: ToolId) => setState((s) => ({ ...s, toolId })), [setState])

  const loadSample = useCallback(
    (sample: Sample) =>
      setState((s) => ({
        step: 3,
        page: 0,
        goal: sample.goal,
        answers: { ...sample.answers },
        toolId: s.toolId ?? 'chatgpt',
      })),
    [setState],
  )

  const reset = useCallback(() => setState(initial), [setState])

  const hasAnswers = Object.values(state.answers).some((v) => v.trim() && v !== defaultPages(state.goal))

  return { state, hasAnswers, selectGoal, setAnswer, goTo, selectTool, loadSample, reset }
}

export type Wizard = ReturnType<typeof useWizard>
