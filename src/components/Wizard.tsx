import { useEffect, useRef } from 'react'
import type { Wizard as WizardApi } from '../hooks/useWizard'
import { visibleQuestions } from '../lib/visible'
import { ProgressBar } from './ProgressBar'
import { StepForm } from './StepForm'
import { StepGoal } from './StepGoal'
import { StepResult } from './StepResult'
import { StepTool } from './StepTool'

export function Wizard({ wizard }: { wizard: WizardApi }) {
  const { state, hasAnswers, selectGoal, setAnswer, goTo, selectTool, reset } = wizard
  const { step, page, goal, answers, toolId } = state
  const pageTotal = goal ? visibleQuestions(goal).length : 0
  const shown = useRef(`${step}:${page}`)

  // เปลี่ยนขั้น: เลื่อนขึ้นบนสุด และย้ายโฟกัสไปที่หัวข้อ ให้ screen reader อ่านขั้นใหม่
  useEffect(() => {
    const key = `${step}:${page}`
    if (shown.current === key) return
    shown.current = key
    window.scrollTo({ top: 0 })
    document.getElementById('step-heading')?.focus({ preventScroll: true })
  }, [step, page])

  return (
    <>
      {step === 0 && !hasAnswers && (
        <div className="mb-6 animate-step-in rounded-3xl bg-linear-to-br from-brand-600 to-sea-600 p-6 text-white shadow-lift">
          <h1 className="text-[26px] font-bold leading-tight">ตอบคำถามง่ายๆ ได้ prompt ทำสไลด์ที่ตรงจุด</h1>
          <p className="mt-2 text-white/90">สำหรับนักเรียน ม.3 · ใช้เวลาราว 3 นาที</p>
        </div>
      )}

      <ProgressBar step={step} page={page} pageTotal={pageTotal} />

      {step === 0 || !goal ? (
        <StepGoal value={goal} onSelect={selectGoal} />
      ) : step === 1 ? (
        <StepForm
          goal={goal}
          page={page}
          answers={answers}
          onAnswer={setAnswer}
          onPage={(p) => goTo(1, p)}
          onBack={() => goTo(0)}
          onDone={() => goTo(2)}
        />
      ) : step === 2 || !toolId ? (
        <StepTool
          value={toolId}
          onSelect={selectTool}
          onBack={() => goTo(1, pageTotal - 1)}
          onNext={() => goTo(3)}
        />
      ) : (
        <StepResult goal={goal} answers={answers} toolId={toolId} onAnswer={setAnswer} onGoTo={goTo} onReset={reset} />
      )}
    </>
  )
}
