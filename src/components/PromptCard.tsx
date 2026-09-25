import type { ReactNode } from 'react'
import { copyText } from '../lib/clipboard'
import type { Tool } from '../types'
import { CopyButton } from './CopyButton'
import { RtcfText } from './Rtcf'
import { useToast } from './Toast'

interface Props {
  /** ลำดับขั้น เช่น 1, 2, 3 */
  step?: number
  title: string
  subtitle?: ReactNode
  text: string
  /** ถ้ากำหนด ปุ่มหลักจะคัดลอกแล้วเปิดแชทใหม่ใน AI ตัวนี้ */
  openTool?: Tool
  children?: ReactNode
}

export function PromptCard({ step, title, subtitle, text, openTool, children }: Props) {
  const notify = useToast()

  return (
    <article className="card deco-card animate-step-in p-4 sm:p-5">
      <div className="flex items-start gap-3">
        {step !== undefined && (
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 font-bold text-white">
            {step}
          </span>
        )}
        <div>
          <h3 className="text-lg font-semibold leading-snug">{title}</h3>
          {subtitle && <p className="text-[15px] text-muted">{subtitle}</p>}
        </div>
      </div>

      {children}

      <div
        tabIndex={0}
        role="region"
        aria-label={`ข้อความ prompt: ${title}`}
        className="mt-3 max-h-96 overflow-auto rounded-2xl border border-line bg-sunken p-3 text-[15px] leading-relaxed"
      >
        <RtcfText text={text} animate />
      </div>

      {openTool ? (
        <div className="mt-3 flex flex-col items-center gap-1">
          <a
            href={openTool.url}
            target="_blank"
            rel="noopener noreferrer"
            // คัดลอกตอนกด แล้วปล่อยให้ลิงก์เปิดแท็บใหม่เอง (ไม่โดนบล็อก pop-up)
            onClick={() => {
              void copyText(text).then((ok) =>
                notify(ok ? `คัดลอกแล้ว วางในช่องแชทของ ${openTool.name} ได้เลย` : 'คัดลอกไม่สำเร็จ กด "คัดลอกอย่างเดียว" แทน'),
              )
            }}
            className="btn-accent w-full text-lg"
          >
            คัดลอก แล้วเปิด {openTool.name} <span aria-hidden="true">↗</span>
            <span className="sr-only">(เปิดในแท็บใหม่)</span>
          </a>
          <CopyButton text={text} variant="link" label="คัดลอกอย่างเดียว" />
        </div>
      ) : (
        <CopyButton text={text} className="mt-3 w-full text-lg" />
      )}
    </article>
  )
}
