import { useState } from 'react'
import { byGoal } from '../lib/byGoal'
import { visibleFields, visibleQuestions } from '../lib/visible'
import type { Answers, GoalId } from '../types'
import { ActionBar } from './ActionBar'
import { FieldInput } from './FieldInput'

interface Props {
  goal: GoalId
  page: number
  answers: Answers
  onAnswer: (id: string, value: string) => void
  onPage: (page: number) => void
  onBack: () => void
  onDone: () => void
}

export function StepForm({ goal, page, answers, onAnswer, onPage, onBack, onDone }: Props) {
  const pages = visibleQuestions(goal)
  const index = Math.min(page, pages.length - 1)
  const question = pages[index]
  const fields = visibleFields(question, goal)
  const isLast = index === pages.length - 1
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleNext() {
    const missing = fields.filter((f) => f.required && !answers[f.id]?.trim())
    if (missing.length > 0) {
      setErrors(Object.fromEntries(missing.map((f) => [f.id, 'ช่องนี้ช่วยให้ prompt ตรงจุดขึ้น กรอกสั้นๆ ก็ได้'])))
      // กลุ่มตัวเลือก (fieldset) ให้โฟกัสปุ่มแรก
      const el = document.getElementById(`f-${missing[0].id}`)
      const target = el?.tagName === 'FIELDSET' ? el.querySelector<HTMLElement>('button') : el
      target?.focus()
      return
    }
    setErrors({})
    if (isLast) onDone()
    else onPage(index + 1)
  }

  function handleBack() {
    setErrors({})
    if (index === 0) onBack()
    else onPage(index - 1)
  }

  return (
    <section key={question.id} aria-labelledby="step-heading" className="animate-step-in">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-100 to-sea-100 text-2xl dark:from-brand-800 dark:to-sea-700"
        >
          {question.emoji}
        </span>
        <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold">
          {byGoal(question.title, goal)}
        </h2>
      </div>
      <p className="mt-2 text-muted">{byGoal(question.subtitle, goal)}</p>

      {question.tip && (
        <p className="mt-4 flex gap-2 rounded-2xl border border-accent-200 bg-accent-50 p-3 text-[15px] text-[#5a2a05] dark:border-accent-700/60 dark:bg-accent-700/15 dark:text-accent-100">
          <span aria-hidden="true">💡</span>
          <span>{question.tip}</span>
        </p>
      )}

      <form
        className="mt-6 space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          handleNext()
        }}
      >
        {fields.map((field) => (
          <FieldInput
            key={field.id}
            field={field}
            goal={goal}
            value={answers[field.id] ?? ''}
            error={errors[field.id]}
            onChange={(v) => {
              onAnswer(field.id, v)
              if (errors[field.id] && v.trim()) setErrors((e) => ({ ...e, [field.id]: '' }))
            }}
          />
        ))}

        <ActionBar>
          <button type="button" onClick={handleBack} className="btn-ghost">
            <span aria-hidden="true">←</span> ย้อนกลับ
          </button>
          <button type="submit" className="btn-primary flex-1 text-lg">
            {isLast ? 'ไปเลือกเครื่องมือ' : 'ถัดไป'} <span aria-hidden="true">→</span>
          </button>
        </ActionBar>
      </form>
    </section>
  )
}
