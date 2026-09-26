import type { ReactNode } from 'react'
import type { BadgeIconName } from '../data'
import type { RtcfPart } from '../types'

const fills: Record<RtcfPart, [string, string]> = {
  R: ['#7856ff', '#4d2fd0'],
  T: ['#4fa6ff', '#1558c0'],
  C: ['#ffa566', '#d95a0a'],
  F: ['#34c48a', '#0b6e4c'],
}

/** ไอคอนกลางเหรียญ (ตาราง 24x24 เส้นสีขาว) */
const glyphs: Record<BadgeIconName | 'lock', ReactNode> = {
  book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />,
  sort: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="#fff" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  fire: <path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5z" />,
  repeat: <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />,
  pencil: <path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" />,
  folder: (
    <>
      <path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M9 13l2 2 4-4" />
    </>
  ),
  slides: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M12 16v4M8 20h8M7 12l3-3 2 2 4-4" />
    </>
  ),
  palette: (
    <>
      <path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-2a2 2 0 0 0-1.5 3.3A2 2 0 0 1 12 21z" />
      <circle cx="8.5" cy="9" r="1" fill="#fff" />
      <circle cx="13" cy="7" r="1" fill="#fff" />
    </>
  ),
  trophy: <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M10 17h4" />,
  scroll: <path d="M6 3h11a3 3 0 0 1 0 6H9M6 3a3 3 0 0 0 0 6h3v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9M12 13h5M12 17h5" />,
  crown: <path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" />,
  coins: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v4c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4M5 14v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" />
    </>
  ),
  gem: <path d="M6 3h12l4 6-10 12L2 9zM2 9h20M9 3l3 6 3-6" />,
  bag: <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9zM9 8V6a3 3 0 0 1 6 0v2" />,
  box: <path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10" />,
  sparkle: <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 2v4M17 4h4" />,
  heart: <path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z" />,
  wand: <path d="M4 20l11-11M15 9l2-2M17 3v3M15.5 4.5h3M20 8v3M18.5 9.5h3M10 4v2M9 5h2" />,
  rainbow: <path d="M3 18a9 9 0 0 1 18 0M6.5 18a5.5 5.5 0 0 1 11 0M10 18a2 2 0 0 1 4 0" />,
  lock: <path d="M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 15v2" />,
}

/** เหรียญตรารางวัล สีตามส่วน RTCF และมีไอคอนของตัวเอง ยังไม่ได้ = สีเทาพร้อมแม่กุญแจ */
export function BadgeIcon({
  part,
  icon,
  locked = false,
  className = '',
}: {
  part: RtcfPart
  icon: BadgeIconName
  locked?: boolean
  className?: string
}) {
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
      <circle cx="32" cy="38" r="17" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
      <g
        transform="translate(22.4 28.4) scale(0.8)"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {glyphs[locked ? 'lock' : icon]}
      </g>
    </svg>
  )
}
