import { checklist, goals } from '../data'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Answers, GoalId } from '../types'

interface Props {
  goal: GoalId | null
  answers: Answers
}

type Checked = Record<string, boolean>

export function Checklist({ goal, answers }: Props) {
  const [checked, setChecked] = useLocalStorage<Checked>('promptfolio:checklist:v1', {}, (raw) =>
    raw && typeof raw === 'object' ? (raw as Checked) : {},
  )
  const groups = checklist
    .map((g) => ({ ...g, items: g.items.filter((i) => !goal || !i.goals || i.goals.includes(goal)) }))
    .filter((g) => g.items.length > 0)
  const allItems = groups.flatMap((g) => g.items)
  const done = allItems.filter((i) => checked[i.id]).length
  const goalTitle = goals.find((g) => g.id === goal)?.title

  return (
    <section aria-labelledby="page-heading" className="animate-step-in">
      <h1 id="page-heading" className="text-2xl font-bold">
        เช็กลิสต์ก่อนส่งพอร์ต
      </h1>
      <p className="mt-1 text-muted">
        {goalTitle ? `ปรับรายการให้เหมาะกับ “${goalTitle}” แล้ว` : 'ติ๊กทีละข้อ ระบบจะจำไว้ให้'}
      </p>

      <div className="card mt-5 p-5">
        <p className="flex items-baseline justify-between">
          <span className="font-semibold">
            {done === allItems.length ? '🎉 พร้อมส่งแล้ว!' : 'ความพร้อม'}
          </span>
          <span className="text-lg font-bold text-brand-700 dark:text-brand-300">
            {done}/{allItems.length}
          </span>
        </p>
        <div
          role="progressbar"
          aria-label="ความพร้อมของพอร์ต"
          aria-valuemin={0}
          aria-valuemax={allItems.length}
          aria-valuenow={done}
          className="mt-2 h-3 overflow-hidden rounded-full bg-sunken ring-1 ring-line"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sea-500 transition-[width] duration-500"
            style={{ width: `${(done / Math.max(allItems.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {groups.map((group) => (
          <fieldset key={group.id} className="card p-5">
            <legend className="sr-only">{group.title}</legend>
            <h2 aria-hidden="true" className="text-lg font-semibold">
              <span>{group.emoji} </span>
              {group.title}
            </h2>
            <ul className="mt-3 space-y-1">
              {group.items.map((item) => {
                const id = `check-${item.id}`
                const auto = item.autoFields
                  ? item.autoFields.every((f) => answers[f]?.trim())
                    ? 'filled'
                    : 'missing'
                  : null
                return (
                  <li key={item.id}>
                    <label
                      htmlFor={id}
                      className="flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl p-2 hover:bg-sunken"
                    >
                      <input
                        id={id}
                        type="checkbox"
                        checked={!!checked[item.id]}
                        onChange={(e) => setChecked((c) => ({ ...c, [item.id]: e.target.checked }))}
                        className="mt-0.5 size-6 shrink-0 cursor-pointer accent-brand-600"
                      />
                      <span className={checked[item.id] ? 'text-muted line-through' : ''}>
                        {item.label}
                        {auto && (
                          <span
                            className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold no-underline ${
                              auto === 'filled'
                                ? 'bg-sea-100 text-sea-700 dark:bg-sea-700/40 dark:text-sea-100'
                                : 'bg-accent-100 text-accent-700 dark:bg-accent-700/40 dark:text-accent-100'
                            }`}
                          >
                            {auto === 'filled' ? 'กรอกในเว็บแล้ว' : 'ยังไม่ได้กรอกในเว็บ'}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </fieldset>
        ))}
      </div>

      {done > 0 && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm('ล้างเครื่องหมายทั้งหมด?')) setChecked({})
          }}
          className="mt-5 min-h-11 w-full rounded-xl text-[15px] font-medium text-muted underline underline-offset-4 hover:text-ink"
        >
          ล้างเช็กลิสต์
        </button>
      )}
    </section>
  )
}
