import { rtcf } from '../data'
import type { Step } from '../hooks/useWizard'
import { PARTS, partStyle } from '../lib/rtcf'
import { visibleQuestions } from '../lib/visible'
import type { GoalId, RtcfPart } from '../types'

const stepLabels = ['เลือกภารกิจ', 'ตอบคำถาม', 'เลือก AI', 'สำเร็จ!']

type Status = 'done' | 'now' | 'todo'

interface Props {
  goal: GoalId | null
  step: Step
  page: number
}

/** แถบความคืบหน้าแบบเส้นทางด่าน R → T → C → F */
export function QuestPath({ goal, step, page }: Props) {
  const pages = goal ? visibleQuestions(goal) : []
  const current = step === 1 ? pages[Math.min(page, pages.length - 1)]?.part : undefined

  function status(part: RtcfPart): Status {
    if (step >= 2) return 'done'
    if (step === 0) return 'todo'
    if (part === current) return 'now'
    const own = pages.map((q, i) => (q.part === part ? i : -1)).filter((i) => i >= 0)
    return own.length > 0 && own.every((i) => i < page) ? 'done' : 'todo'
  }

  const doneCount = PARTS.filter((p) => status(p) === 'done').length
  const percent = step >= 2 ? 100 : (doneCount / PARTS.length) * 100

  return (
    <div className="mb-6">
      <p className="flex justify-between text-sm text-muted">
        <span>
          ด่านที่ {step + 1}/4 · <span className="font-semibold text-ink">{stepLabels[step]}</span>
        </span>
        {step === 1 && pages.length > 0 && (
          <span>
            คำถาม {Math.min(page + 1, pages.length)}/{pages.length}
          </span>
        )}
      </p>

      <div
        role="progressbar"
        aria-label="ความคืบหน้าภารกิจ"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        className="relative mt-3 px-5"
      >
        {/* เส้นทางเชื่อมด่าน */}
        <div className="absolute inset-x-8 top-5 h-2 rounded-full bg-line" />
        <div
          className="absolute left-8 top-5 h-2 rounded-full bg-linear-to-r from-brand-500 via-sea-500 via-60% to-mint-500 transition-[width] duration-700"
          style={{ width: `calc((100% - 4rem) * ${percent / 100})` }}
        />
        <ol className="relative flex justify-between">
          {PARTS.map((part) => {
            const s = status(part)
            const info = rtcf.find((r) => r.id === part)!
            return (
              <li key={part} className="flex w-12 flex-col items-center gap-1">
                <span
                  className={`grid size-12 place-items-center rounded-full border-4 border-bg font-display text-lg font-bold transition duration-500 ${
                    s === 'todo' ? 'bg-sunken text-muted ring-1 ring-line' : partStyle[part].tile
                  } ${s === 'now' ? 'scale-110 animate-glow' : ''} ${s === 'done' ? 'animate-pop' : ''}`}
                >
                  {s === 'done' ? (
                    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    part
                  )}
                </span>
                <span className={`text-xs font-semibold ${s === 'todo' ? 'text-muted' : partStyle[part].text}`}>{info.en}</span>
                <span className="sr-only">
                  {info.th} {s === 'done' ? 'ผ่านแล้ว' : s === 'now' ? 'กำลังทำ' : 'ยังไม่ถึง'}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
