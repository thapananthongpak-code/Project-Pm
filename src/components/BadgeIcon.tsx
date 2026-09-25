import type { RtcfPart } from '../types'

const fills: Record<RtcfPart, [string, string]> = {
  R: ['#7856ff', '#4d2fd0'],
  T: ['#4fa6ff', '#1558c0'],
  C: ['#ffa566', '#d95a0a'],
  F: ['#34c48a', '#0b6e4c'],
}

/** เหรียญรางวัล สีตามส่วน RTCF */
export function BadgeIcon({ part, className = '', locked = false }: { part: RtcfPart; className?: string; locked?: boolean }) {
  const [light, dark] = locked ? ['#d8d3e8', '#a9a3bf'] : fills[part]
  const gid = `badge-${part}-${locked ? 'l' : 'u'}`
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      {/* ริบบิ้น */}
      <path d="M20 4h10l-4 22h-10z" fill={dark} opacity="0.85" />
      <path d="M44 4h-10l4 22h10z" fill={dark} opacity="0.85" />
      <circle cx="32" cy="38" r="22" fill={`url(#${gid})`} />
      <circle cx="32" cy="38" r="16" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" />
      <text x="32" y="45" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff" fontFamily="Prompt, sans-serif">
        {locked ? '?' : part}
      </text>
    </svg>
  )
}
