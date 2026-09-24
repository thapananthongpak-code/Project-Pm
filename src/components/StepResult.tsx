import { useState } from 'react'
import { goals, refinements } from '../data'
import type { Step } from '../hooks/useWizard'
import { buildPrompts, buildRefinePrompt, countBlanks, firstBlankPage } from '../lib/promptBuilder'
import type { Answers, GoalId, ToolId } from '../types'
import { CopyButton } from './CopyButton'
import { ImagePrompt } from './ImagePrompt'
import { PromptCard } from './PromptCard'

interface Props {
  goal: GoalId
  answers: Answers
  toolId: ToolId
  onAnswer: (id: string, value: string) => void
  onGoTo: (step: Step, page?: number) => void
  onReset: () => void
}

export function StepResult({ goal, answers, toolId, onAnswer, onGoTo, onReset }: Props) {
  const [refineId, setRefineId] = useState<string | null>(null)
  const { content, design, tool } = buildPrompts(goal, answers, toolId)
  const blanks = countBlanks(content) + countBlanks(design)
  const goalInfo = goals.find((g) => g.id === goal)

  return (
    <section aria-labelledby="step-heading" className="animate-step-in">
      <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold">
        Prompt พร้อมแล้ว
      </h2>
      <p className="mt-1 text-muted">ทำตามทีละขั้นใน {tool.name}</p>

      {blanks > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-2 text-[#5a2a05] dark:border-accent-700/60 dark:bg-accent-700/15 dark:text-accent-100">
          <span className="flex-1">ยังมีช่องว่าง [__] {blanks} จุด</span>
          <button
            type="button"
            onClick={() => onGoTo(1, Math.max(firstBlankPage(goal, answers), 0))}
            className="min-h-10 rounded-xl font-semibold underline underline-offset-4"
          >
            กลับไปเติม
          </button>
        </p>
      )}

      <div className="mt-5 space-y-4">
        <PromptCard step={1} title="เขียนเนื้อหา" subtitle={`เปิดแชทใหม่ใน ${tool.name} แล้ววาง`} text={content} openTool={tool} />
        <PromptCard step={2} title="ทำเป็นสไลด์" subtitle="ได้เนื้อหาแล้ว วางต่อในแชทเดิม" text={design} />
        <ImagePrompt goal={goal} answers={answers} tool={tool} onAnswer={onAnswer} />
      </div>

      <div className="card mt-4 p-4 sm:p-5">
        <h3 className="font-semibold">ปรับเนื้อหาเพิ่ม</h3>
        <p className="text-[15px] text-muted">เลือกแล้วคัดลอกไปวางต่อในแชทเดิม</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {refinements.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={refineId === r.id}
              onClick={() => setRefineId(refineId === r.id ? null : r.id)}
              className={`min-h-11 rounded-2xl border px-3 font-medium transition ${
                refineId === r.id
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-line bg-surface hover:border-brand-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {refineId && (
          <div className="mt-3">
            <pre className="whitespace-pre-wrap wrap-break-word rounded-2xl border border-line bg-sunken p-4 font-sans text-[15px] leading-relaxed">
              {buildRefinePrompt(goal, refineId)}
            </pre>
            <CopyButton key={refineId} text={buildRefinePrompt(goal, refineId)} className="mt-3 w-full" />
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-[15px] text-muted">
        AI อาจแต่งเรื่องเพิ่มเอง อ่านทวนก่อนใช้ทุกครั้ง
        {goalInfo?.note && <> · {goalInfo.note}</>}
      </p>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => onGoTo(1, 0)} className="btn-ghost flex-1">
          แก้คำตอบ
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('ล้างคำตอบทั้งหมดแล้วเริ่มใหม่?')) onReset()
          }}
          className="btn-ghost flex-1"
        >
          เริ่มใหม่
        </button>
      </div>
    </section>
  )
}
