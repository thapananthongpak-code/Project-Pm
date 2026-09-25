import { useState } from 'react'
import { byGoal } from '../lib/byGoal'
import { visibleFields, visibleQuestions } from '../lib/visible'
import type { Answers, GoalId } from '../types'
import { ActionBar } from './ActionBar'
import { FieldInput } from './FieldInput'
import { MascotTip } from './Mascot'
import { RtcfTag } from './Rtcf'

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
  const fields = visibleFields(question, goal, answers)
  const isLast = index === pages.length - 1
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleNext() {
    const missing = fields.filter((f) => f.required && !answers[f.id]?.trim())
    if (missing.length > 0) {
      setErrors(Object.fromEntries(missing.map((f) => [f.id, 'กรอกช่องนี้ก่อนนะ สั้นๆ ก็ได้'])))
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
        <span className="animate-bounce-in">
          <RtcfTag part={question.part} size="lg" />
        </span>
        <div>
          <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold lg:text-3xl">
            {byGoal(question.title, goal)}
          </h2>
          <p className="text-muted">{byGoal(question.subtitle, goal)}</p>
        </div>
      </div>

      <MascotTip mood={Object.keys(errors).some((k) => errors[k]) ? 'think' : 'idle'} className="mt-4">
        {byGoal(question.why, goal)}
      </MascotTip>

      <form
        id="step-form"
        className="mt-5 space-y-5"
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
            ย้อนกลับ
          </button>
          {/* ปุ่มนี้ถูกส่งออกไปนอก <form> (ActionBar) จึงผูกกับฟอร์มด้วย form="step-form" */}
          <button type="submit" form="step-form" className="btn-primary flex-1 text-lg">
            {isLast ? 'เลือก AI' : 'ถัดไป'}
          </button>
        </ActionBar>
      </form>
    </section>
  )
}
