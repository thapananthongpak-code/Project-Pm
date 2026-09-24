import { useState } from 'react'
import { goals, refinements } from '../data'
import type { Step } from '../hooks/useWizard'
import { buildPrompts, buildRefinePrompt, countBlanks, firstBlankPage } from '../lib/promptBuilder'
import type { Answers, GoalId, ToolId } from '../types'
import { PromptCard } from './PromptCard'

interface Props {
  goal: GoalId
  answers: Answers
  toolId: ToolId
  onGoTo: (step: Step, page?: number) => void
  onReset: () => void
}

export function StepResult({ goal, answers, toolId, onGoTo, onReset }: Props) {
  const [refineId, setRefineId] = useState<string | null>(null)
  const { content, design, contentTool, designTool } = buildPrompts(goal, answers, toolId)
  const picked = designTool ?? contentTool
  const blanks = countBlanks(content) + countBlanks(design)
  const goalInfo = goals.find((g) => g.id === goal)

  return (
    <section aria-labelledby="step-heading" className="animate-step-in">
      <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold">
        Prompt พร้อมแล้ว <span aria-hidden="true">🎉</span>
      </h2>

      {blanks > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-2 text-[#5a2a05] dark:border-accent-700/60 dark:bg-accent-700/15 dark:text-accent-100">
          <span className="flex-1">
            ยังมีช่อง <mark className="rounded bg-accent-100 px-1 text-accent-700">[__]</mark> {blanks} จุด
          </span>
          <button
            type="button"
            onClick={() => onGoTo(1, Math.max(firstBlankPage(goal, answers), 0))}
            className="min-h-10 rounded-xl font-semibold underline underline-offset-4"
          >
            กลับไปเติม
          </button>
        </p>
      )}

      {/* การ์ด 1: Prompt ของคุณ */}
      <div className="mt-5 space-y-3">
        <PromptCard
          badge="ขั้น ก · เขียนเนื้อหา"
          title={`วางใน ${contentTool.name}`}
          text={content}
          copyToast={`คัดลอกแล้ว! ไปวางใน ${contentTool.name} ได้เลย`}
        />
        <PromptCard
          badge="ขั้น ข · ทำสไลด์"
          tone="sea"
          title={`ใช้กับ ${designTool?.name ?? 'Canva / Gamma / Google Slides'}`}
          subtitle="วางเนื้อหาจากขั้น ก แทนช่องสีส้ม"
          text={design}
          copyToast="คัดลอกแล้ว! อย่าลืมวางเนื้อหาจากขั้น ก แทนช่องสีส้ม"
        />
      </div>

      {/* การ์ด 2: ขั้นต่อไป */}
      <div className="card mt-5 p-5">
        <h3 className="font-display text-xl font-bold">
          <span aria-hidden="true">🚀 </span>ขั้นต่อไป
        </h3>
        <ol className="mt-3 space-y-2">
          {picked.howTo.map((text, i) => (
            <li key={text} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
        <a href={picked.url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 w-full">
          เปิด {picked.name} <span aria-hidden="true">↗</span>
          <span className="sr-only">(เปิดในแท็บใหม่)</span>
        </a>
        <p className="mt-3 text-[15px] text-muted">
          <span aria-hidden="true">⚠️ </span>
          AI อาจแต่งเรื่องเพิ่มเอง อ่านทวนก่อนใช้ทุกครั้ง
          {goalInfo?.note && <> · {goalInfo.note}</>}
        </p>

        <h4 className="mt-5 font-semibold">ต่อยอด (วางต่อในแชทเดิม)</h4>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {refinements.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={refineId === r.id}
              onClick={() => setRefineId(refineId === r.id ? null : r.id)}
              className={`min-h-12 rounded-2xl border-2 px-3 font-medium transition ${
                refineId === r.id
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-line bg-surface hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/40'
              }`}
            >
              <span aria-hidden="true">{r.emoji} </span>
              {r.label}
            </button>
          ))}
        </div>
        {refineId && (
          <div className="mt-3">
            <PromptCard
              key={refineId}
              badge="ต่อยอด"
              tone="accent"
              title={refinements.find((r) => r.id === refineId)?.label ?? ''}
              text={buildRefinePrompt(goal, refineId)}
            />
          </div>
        )}

        <div className="mt-5 flex gap-2">
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
      </div>
    </section>
  )
}
