import { useEffect, useRef } from 'react'
import type { Wizard as WizardApi } from '../hooks/useWizard'
import { PARTS } from '../lib/rtcf'
import { visibleQuestions } from '../lib/visible'
import { Mascot } from './Mascot'
import { QuestPath } from './QuestPath'
import { RtcfTag } from './Rtcf'
import { StepForm } from './StepForm'
import { StepGoal } from './StepGoal'
import { StepResult } from './StepResult'
import { StepTool } from './StepTool'

export function Wizard({ wizard }: { wizard: WizardApi }) {
  const { state, selectGoal, setAnswer, goTo, selectTool, reset } = wizard
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
      {step === 0 && (
        <div className="mb-8 flex animate-step-in items-center gap-4 lg:mb-10">
          <Mascot mood="happy" className="size-24 shrink-0 sm:size-32" />
          <div>
            <h1 className="text-[26px] font-bold leading-tight sm:text-4xl lg:text-5xl">
              ภารกิจเขียน Prompt
              <br />
              <span className="bg-linear-to-r from-brand-600 via-sea-600 to-mint-600 bg-clip-text text-transparent dark:from-brand-300 dark:via-sea-300 dark:to-mint-300">
                ด้วยหลัก RTCF
              </span>
            </h1>
            <div className="mt-3 flex gap-1.5">
              {PARTS.map((p, i) => (
                <span key={p} className="animate-bounce-in" style={{ animationDelay: `${200 + i * 120}ms` }}>
                  <RtcfTag part={p} size="sm" />
                </span>
              ))}
              <span className="ml-1 self-center text-sm text-muted">ผ่านทีละด่าน สะสมเหรียญ</span>
            </div>
          </div>
        </div>
      )}

      <QuestPath goal={goal} step={step} page={page} />

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
          goal={goal}
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
