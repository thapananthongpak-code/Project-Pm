import { goals } from '../data'
import type { ReactNode } from 'react'
import type { GoalId } from '../types'

interface Props {
  value: GoalId | null
  onSelect: (goal: GoalId) => void
}

/** ไอคอนภารกิจ */
const icons: Record<GoalId, ReactNode> = {
  m4: (
    <>
      <path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M9 13l2 2 4-4" />
    </>
  ),
  present: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M12 16v4M8 20h8M7 12l3-3 2 2 4-4" />
    </>
  ),
  image: (
    <>
      <circle cx="13.5" cy="6.5" r="1.5" />
      <circle cx="17.5" cy="10.5" r="1.5" />
      <circle cx="8.5" cy="7.5" r="1.5" />
      <path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-2a2 2 0 0 0-1.5 3.3A2 2 0 0 1 12 21z" />
    </>
  ),
}

/** สีประจำการ์ดภารกิจ */
const accents = [
  'from-brand-500 to-sea-500',
  'from-sea-500 to-mint-500',
  'from-accent-400 to-brand-500',
]

export function StepGoal({ value, onSelect }: Props) {
  return (
    <section aria-labelledby="step-heading" className="animate-step-in">
      <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold">
        เลือกภารกิจ
      </h2>

      <div role="radiogroup" aria-labelledby="step-heading" className="mt-4 grid gap-3 md:grid-cols-3 lg:gap-5">
        {goals.map((goal, i) => {
          const selected = value === goal.id
          return (
            <button
              key={goal.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(goal.id)}
              style={{ animationDelay: `${i * 90}ms` }}
              className={`card group relative flex w-full animate-fly-in items-center justify-between gap-4 overflow-hidden p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-lift active:scale-[0.98] md:min-h-48 md:flex-col md:items-start md:p-6 ${
                selected ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              {/* แถบสีด้านบนการ์ด */}
              <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 bg-linear-to-r ${accents[i % accents.length]}`} />
              <span className="flex items-start gap-3 md:flex-col">
                <span
                  aria-hidden="true"
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-white shadow-soft transition duration-300 group-hover:-rotate-6 group-hover:scale-110 ${accents[i % accents.length]}`}
                >
                  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {icons[goal.id]}
                  </svg>
                </span>
                <span>
                <span className="block text-xs font-bold tracking-wide text-muted">ภารกิจที่ {i + 1}</span>
                <span className="block font-display text-lg font-semibold lg:text-2xl">{goal.title}</span>
                <span className="block text-[15px] text-muted">{goal.description}</span>
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br text-white shadow-soft transition duration-300 group-hover:translate-x-1 md:self-end ${
                  accents[i % accents.length]
                }`}
              >
                →
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
