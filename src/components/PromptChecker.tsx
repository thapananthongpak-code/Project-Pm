import { useEffect, useMemo } from 'react'
import { rtcf } from '../data'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { analyzePrompt, improvePrompt, weakSample } from '../lib/promptChecker'
import { PARTS, partStyle } from '../lib/rtcf'
import { useGame } from './Game'
import { MascotTip } from './Mascot'
import { PromptCard } from './PromptCard'
import { RtcfTag } from './Rtcf'

const statusText = { none: 'ยังไม่มี', some: 'มีบางส่วน', all: 'ครบ' }

export function PromptChecker() {
  const [text, setText] = useLocalStorage('promptfolio:checker:v1', '', (raw) => (typeof raw === 'string' ? raw : ''))
  const analysis = useMemo(() => analyzePrompt(text), [text])
  const hasText = text.trim().length > 0
  const missing = analysis.results.filter((r) => !r.pass)
  const { award } = useGame()

  useEffect(() => {
    if (analysis.complete) award({ key: 'checker', stars: 30, badge: 'checker' })
  }, [analysis.complete, award])

  const partsFound = PARTS.filter((p) => analysis.parts[p] !== 'none').length

  return (
    <section aria-labelledby="page-heading" className="animate-step-in">
      <h1 id="page-heading" className="text-2xl font-bold lg:text-3xl">
        ตรวจ prompt ตามหลัก RTCF
      </h1>
      <p className="mt-1 text-muted">วาง prompt ที่เขียนเอง แล้วดูว่าครบ R T C F หรือยัง</p>

      <div className="mt-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <div>
          <label htmlFor="checker-input" className="sr-only">
            prompt ของคุณ
          </label>
          <textarea
            id="checker-input"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="เช่น ช่วยทำสไลด์วิทยาศาสตร์เรื่องระบบสุริยะให้หน่อย..."
            className="field resize-y"
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

          {/* ป้าย R T C F ติดไฟตามที่ตรวจเจอ */}
          <div className="mt-4 grid grid-cols-4 gap-2" aria-live="polite">
            {PARTS.map((p) => {
              const s = hasText ? analysis.parts[p] : 'none'
              const info = rtcf.find((r) => r.id === p)!
              return (
                <div
                  key={`${p}-${s}`}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 text-center transition duration-300 ${
                    s === 'none' ? 'border-line bg-surface opacity-60' : `${partStyle[p].border} ${partStyle[p].soft} animate-pop`
                  }`}
                >
                  <span
                    className={`grid size-10 place-items-center rounded-xl font-display text-xl font-bold ${
                      s === 'none' ? 'bg-sunken text-muted' : partStyle[p].tile
                    }`}
                  >
                    {p}
                  </span>
                  <span className="text-xs font-semibold">{info.th}</span>
                  <span className={`text-xs ${s === 'none' ? 'text-muted' : partStyle[p].text}`}>{statusText[s]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {hasText && (
          <div className="mt-5 space-y-4 lg:mt-0" aria-live="polite">
            <MascotTip mood={analysis.complete ? 'happy' : partsFound >= 2 ? 'idle' : 'think'}>
              {analysis.complete
                ? `เก่งมาก! มีครบ R T C F แล้ว (ผ่าน ${analysis.passed}/${analysis.total} ข้อ)`
                : `มีแล้ว ${partsFound} จาก 4 ส่วน เติมส่วนที่ขาดอีกนิดนะ`}
              {analysis.blanks > 0 && ` · ยังมีช่องว่าง [__] ${analysis.blanks} จุด`}
            </MascotTip>

            {missing.length > 0 && (
              <div className="card p-4 sm:p-5">
                <h2 className="font-semibold">ยังขาด</h2>
                <ul className="mt-2 space-y-2">
                  {missing.map(({ rule }, i) => (
                    <li
                      key={rule.id}
                      className="flex animate-fly-in gap-3 rounded-2xl bg-sunken px-3 py-2"
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      {rule.part === 'bonus' ? (
                        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-line text-xs font-bold">+</span>
                      ) : (
                        <RtcfTag part={rule.part} size="sm" />
                      )}
                      <span>
                        <span className="font-semibold">{rule.label}</span>
                        <span className="block text-[15px] text-muted">เช่น “{rule.fix}”</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {missing.length > 0 && (
              <PromptCard
                title="prompt ที่เติมส่วนที่ขาดให้แล้ว"
                subtitle="แก้ช่องสีส้มเป็นข้อมูลจริงก่อนใช้"
                text={improvePrompt(text, analysis)}
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
