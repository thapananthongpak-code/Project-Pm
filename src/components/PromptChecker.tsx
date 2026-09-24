import { useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { analyzePrompt, improvePrompt, weakSample } from '../lib/promptChecker'
import { PromptCard } from './PromptCard'

function verdict(ratio: number) {
  if (ratio >= 0.8) return { text: 'ดีมาก พร้อมใช้', bar: 'bg-sea-500' }
  if (ratio >= 0.5) return { text: 'พอใช้ เติมอีกนิด', bar: 'bg-brand-500' }
  return { text: 'ยังขาดหลายอย่าง', bar: 'bg-accent-400' }
}

export function PromptChecker() {
  const [text, setText] = useLocalStorage('promptfolio:checker:v1', '', (raw) => (typeof raw === 'string' ? raw : ''))
  const analysis = useMemo(() => analyzePrompt(text), [text])
  const hasText = text.trim().length > 0
  const ratio = analysis.passed / analysis.total
  const v = verdict(ratio)
  const missing = analysis.results.filter((r) => !r.pass)

  return (
    <section aria-labelledby="page-heading" className="animate-step-in">
      <h1 id="page-heading" className="text-2xl font-bold">
        ตรวจ prompt
      </h1>
      <p className="mt-1 text-muted">วาง prompt ที่เขียนเอง แล้วดูว่ายังขาดอะไร</p>

      <label htmlFor="checker-input" className="sr-only">
        prompt ของคุณ
      </label>
      <textarea
        id="checker-input"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="เช่น ช่วยทำสไลด์วิทยาศาสตร์เรื่องระบบสุริยะให้หน่อย..."
        className="field mt-4 resize-y"
      />
      <div className="mt-2 flex gap-2">
        {hasText ? (
          <button type="button" onClick={() => setText('')} className="btn-ghost min-h-11 text-[15px]">
            ล้างข้อความ
          </button>
        ) : (
          <button type="button" onClick={() => setText(weakSample)} className="btn-ghost min-h-11 text-[15px]">
            ลองกับตัวอย่าง
          </button>
        )}
      </div>

      {hasText && (
        <div className="mt-5 space-y-4" aria-live="polite">
          <div className="card p-5">
            <p className="flex items-baseline justify-between gap-2">
              <span className="font-display text-xl font-bold">
                {v.text}
              </span>
              <span className="text-lg font-bold text-brand-700 dark:text-brand-300">
                {analysis.passed}/{analysis.total}
              </span>
            </p>
            <div
              role="meter"
              aria-label="คะแนน prompt"
              aria-valuemin={0}
              aria-valuemax={analysis.total}
              aria-valuenow={analysis.passed}
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-sunken ring-1 ring-line"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${v.bar}`}
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
            {analysis.blanks > 0 && (
              <p className="mt-3 text-[15px] text-accent-700 dark:text-accent-300">
                ยังมีช่องที่ยังไม่เติม {analysis.blanks} จุด เช่น [__]
              </p>
            )}

            {missing.length > 0 && (
              <>
                <h2 className="mt-4 font-semibold">ยังขาด</h2>
                <ul className="mt-2 space-y-2">
                  {missing.map(({ rule }) => (
                    <li key={rule.id} className="rounded-2xl bg-accent-50 px-3 py-2 dark:bg-accent-700/15">
                      <span className="font-semibold">{rule.label}</span>
                      <span className="block text-[15px] text-muted">เช่น “{rule.fix}”</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {missing.length > 0 && (
            <PromptCard
              title="prompt ที่เติมส่วนที่ขาดให้แล้ว"
              subtitle="แก้ช่องสีส้มเป็นข้อมูลจริงก่อนใช้"
              text={improvePrompt(text, analysis)}
            />
          )}
        </div>
      )}
    </section>
  )
}
