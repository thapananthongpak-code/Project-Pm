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
  onOpenChecklist: () => void
  onOpenChecker: () => void
  onReset: () => void
}

export function StepResult({ goal, answers, toolId, onGoTo, onOpenChecklist, onOpenChecker, onReset }: Props) {
  const [refineId, setRefineId] = useState<string | null>(null)
  const { content, design, contentTool, designTool } = buildPrompts(goal, answers, toolId)
  const picked = designTool ?? contentTool
  const blanks = countBlanks(content) + countBlanks(design)
  const blankPage = firstBlankPage(goal, answers)
  const goalInfo = goals.find((g) => g.id === goal)

  return (
    <section aria-labelledby="step-heading" className="animate-step-in">
      <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold">
        Prompt ของคุณพร้อมแล้ว <span aria-hidden="true">🎉</span>
      </h2>
      <p className="mt-1 text-muted">คัดลอกขั้น ก ไปใช้ก่อน ได้เนื้อหาแล้วค่อยใช้ขั้น ข</p>

      {blanks > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-4 text-[#5a2a05] dark:border-accent-700/60 dark:bg-accent-700/15 dark:text-accent-100">
          <p className="flex-1">
            <span aria-hidden="true">✏️ </span>
            ยังมีช่อง <mark className="rounded bg-accent-100 px-1 text-accent-700">[__]</mark> อยู่ {blanks} จุด
            เติมให้ครบ AI จะเขียนได้ตรงขึ้น
          </p>
          <button
            type="button"
            onClick={() => onGoTo(1, Math.max(blankPage, 0))}
            className="btn-ghost min-h-11 text-[15px]"
          >
            กลับไปเติม
          </button>
        </div>
      )}

      {/* การ์ด 1: Prompt ของคุณ */}
      <div className="mt-6 rounded-[28px] bg-gradient-to-br from-brand-100 to-sea-100 p-2 dark:from-brand-900 dark:to-sea-700/40 sm:p-3">
        <h3 className="px-2 pb-2 pt-1 font-display text-xl font-bold text-brand-900 dark:text-brand-100">
          <span aria-hidden="true">✨ </span>Prompt ของคุณ
        </h3>
        <div className="space-y-3">
          <PromptCard
            badge="ขั้น ก · เขียนเนื้อหา"
            title="ให้ AI ร่างเนื้อหาทีละสไลด์"
            subtitle={
              <>
                วางใน <strong className="text-ink">{contentTool.name}</strong> (หรือ Claude / Gemini ก็ได้)
              </>
            }
            text={content}
            copyToast={`คัดลอกแล้ว! ไปวางใน ${contentTool.name} ได้เลย`}
          />
          <PromptCard
            badge="ขั้น ข · เจนดีไซน์"
            tone="sea"
            title="ให้ AI จัดหน้าตาสไลด์"
            subtitle={
              <>
                ใช้กับ <strong className="text-ink">{designTool?.name ?? 'Canva / Gamma / Google Slides'}</strong>{' '}
                แล้วแทนที่ช่องสีส้มด้วยเนื้อหาจากขั้น ก
              </>
            }
            text={design}
            copyToast="คัดลอกแล้ว! อย่าลืมวางเนื้อหาจากขั้น ก แทนช่องสีส้ม"
          />
        </div>
      </div>

      {/* การ์ด 2: ขั้นต่อไป */}
      <div className="card mt-6 p-5">
        <h3 className="font-display text-xl font-bold">
          <span aria-hidden="true">🚀 </span>ขั้นต่อไป
        </h3>

        <h4 className="mt-4 font-semibold">วิธีใช้กับ {picked.name}</h4>
        <ol className="mt-2 space-y-2">
          {picked.howTo.map((text, i) => (
            <li key={text} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
        <a
          href={picked.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4 w-full"
        >
          เปิด {picked.name} <span aria-hidden="true">↗</span>
          <span className="sr-only">(เปิดในแท็บใหม่)</span>
        </a>

        <p className="mt-4 flex gap-2 rounded-2xl bg-sunken p-3 text-[15px]">
          <span aria-hidden="true">⚠️</span>
          <span>
            AI อาจแต่งเรื่องเพิ่มเอง อ่านทวนทุกครั้งว่าเป็นเรื่องจริงของเรา
            {goalInfo?.note && <> · {goalInfo.note}</>}
          </span>
        </p>

        <h4 className="mt-6 font-semibold">ได้เนื้อหาแล้ว อยากต่อยอด?</h4>
        <p className="text-[15px] text-muted">กดเลือก แล้วคัดลอกไปวางต่อในแชทเดิม</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {refinements.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={refineId === r.id}
              onClick={() => setRefineId(refineId === r.id ? null : r.id)}
              className={`min-h-12 rounded-2xl border-2 px-3 py-2 text-left font-medium transition ${
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
          <div className="mt-4">
            <PromptCard
              key={refineId}
              badge="ต่อยอด"
              tone="accent"
              title={refinements.find((r) => r.id === refineId)?.label ?? ''}
              subtitle="วางต่อในแชทเดียวกับที่ได้เนื้อหาจากขั้น ก"
              text={buildRefinePrompt(goal, refineId)}
            />
          </div>
        )}

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={onOpenChecklist} className="btn-ghost">
            <span aria-hidden="true">✅</span> เช็กลิสต์ก่อนส่งพอร์ต
          </button>
          <button type="button" onClick={onOpenChecker} className="btn-ghost">
            <span aria-hidden="true">🔍</span> ตรวจ prompt ที่เขียนเอง
          </button>
          <button type="button" onClick={() => onGoTo(1, 0)} className="btn-ghost">
            <span aria-hidden="true">✏️</span> แก้คำตอบ
          </button>
          <button type="button" onClick={() => onGoTo(2)} className="btn-ghost">
            <span aria-hidden="true">🔁</span> เปลี่ยนเครื่องมือ
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('ล้างคำตอบทั้งหมดแล้วเริ่มใหม่?')) onReset()
          }}
          className="mt-4 min-h-11 w-full rounded-xl text-[15px] font-medium text-muted underline underline-offset-4 hover:text-ink"
        >
          เริ่มใหม่ทั้งหมด
        </button>
      </div>
    </section>
  )
}
