import { rtcf } from '../data'
import { partStyle, splitSections } from '../lib/rtcf'
import type { RtcfPart } from '../types'

/** ป้ายตัวอักษร R/T/C/F */
export function RtcfTag({
  part,
  size = 'md',
  withName = false,
  className = '',
}: {
  part: RtcfPart
  size?: 'sm' | 'md' | 'lg'
  withName?: boolean
  className?: string
}) {
  const info = rtcf.find((r) => r.id === part)!
  const box = { sm: 'size-6 text-xs rounded-md', md: 'size-9 text-lg rounded-xl', lg: 'size-16 text-3xl rounded-2xl' }[size]
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`grid shrink-0 place-items-center font-display font-bold shadow-soft ${box} ${partStyle[part].tile}`}>
        {part}
      </span>
      {withName && (
        <span className="leading-tight">
          <span className={`block font-display font-bold ${partStyle[part].text}`}>{info.en}</span>
          <span className="block text-sm text-muted">{info.th}</span>
        </span>
      )}
      {!withName && <span className="sr-only">{`${info.en} (${info.th})`}</span>}
    </span>
  )
}

/** ไฮไลต์ช่องที่ต้องเติม เช่น [__] */
function highlight(text: string) {
  return text.split(/(\[[^\]\n]*\])/g).map((part, i) =>
    /^\[[^\]\n]*\]$/.test(part) ? (
      <mark key={i} className="rounded-md bg-accent-100 px-1 text-accent-700 dark:bg-accent-700/40 dark:text-accent-200">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

/** แสดง prompt โดยแยกสีตามส่วน R/T/C/F ให้นักเรียนเห็นโครงสร้าง */
export function RtcfText({ text, animate = false }: { text: string; animate?: boolean }) {
  const sections = splitSections(text)
  return (
    <div className="space-y-2">
      {sections.map((s, i) =>
        s.part ? (
          <div
            key={i}
            className={`flex gap-3 rounded-2xl border-l-4 p-3 ${partStyle[s.part].soft} ${partStyle[s.part].border} ${
              animate ? 'animate-fly-in' : ''
            }`}
            style={animate ? { animationDelay: `${i * 140}ms` } : undefined}
          >
            <RtcfTag part={s.part} size="sm" className="mt-0.5 self-start" />
            <div className="min-w-0 wrap-break-word">
              <span className={`font-semibold ${partStyle[s.part].text}`}>{rtcf.find((r) => r.id === s.part)?.th}:</span>
              {s.lead && <> {highlight(s.lead)}</>}
              {s.lines.some((l) => l.trim()) && (
                <span className="block whitespace-pre-wrap">{highlight(s.lines.filter((l) => l.trim()).join('\n'))}</span>
              )}
            </div>
          </div>
        ) : (
          <p key={i} className="whitespace-pre-wrap wrap-break-word px-1">
            {highlight(s.lines.join('\n'))}
          </p>
        ),
      )}
    </div>
  )
}
