import type { ReactNode } from 'react'

export type Mood = 'idle' | 'happy' | 'think' | 'wow' | 'sad'

/** มาสคอต "น้องพรอมต์" หุ่นยนต์ผู้ช่วย ลอยขึ้นลง กะพริบตา และเปลี่ยนสีหน้าตามอารมณ์ */
export function Mascot({ mood = 'idle', className = '' }: { mood?: Mood; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`animate-float ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id="bot-head" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7856ff" />
          <stop offset="1" stopColor="#2f8bff" />
        </linearGradient>
      </defs>
      {/* เสาอากาศ */}
      <line x1="60" y1="22" x2="60" y2="10" stroke="#4d2fd0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="9" r="6" fill="#ff8a3d" className="animate-pulse" />
      {/* หู */}
      <rect x="10" y="50" width="10" height="24" rx="5" fill="#4d2fd0" />
      <rect x="100" y="50" width="10" height="24" rx="5" fill="#4d2fd0" />
      {/* หัว */}
      <rect x="16" y="22" width="88" height="80" rx="30" fill="url(#bot-head)" />
      {/* จอหน้า */}
      <rect x="27" y="36" width="66" height="50" rx="20" fill="#fffaf3" />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      {/* แก้ม */}
      <circle cx="38" cy="72" r="4.5" fill="#ffa566" opacity="0.7" />
      <circle cx="82" cy="72" r="4.5" fill="#ffa566" opacity="0.7" />
    </svg>
  )
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 'happy') {
    return (
      <g stroke="#1f1a3d" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M40 60q6-8 12 0" />
        <path d="M68 60q6-8 12 0" />
      </g>
    )
  }
  const look = mood === 'think' ? 4 : 0
  const r = mood === 'wow' ? 7 : 6
  return (
    <g className="origin-[60px_58px] animate-blink" fill="#1f1a3d">
      <circle cx={46 + look} cy={mood === 'sad' ? 60 : 58} r={r} />
      <circle cx={74 + look} cy={mood === 'sad' ? 60 : 58} r={r} />
      <circle cx={48 + look} cy="55" r="2" fill="#fff" />
      <circle cx={76 + look} cy="55" r="2" fill="#fff" />
    </g>
  )
}

function Mouth({ mood }: { mood: Mood }) {
  const common = { stroke: '#1f1a3d', strokeWidth: 3.5, strokeLinecap: 'round' as const, fill: 'none' }
  if (mood === 'wow') return <ellipse cx="60" cy="75" rx="5" ry="6" fill="#1f1a3d" />
  if (mood === 'think') return <path d="M54 76h12" {...common} />
  if (mood === 'sad') return <path d="M52 78q8-7 16 0" {...common} />
  if (mood === 'happy') return <path d="M48 71q12 12 24 0z" fill="#1f1a3d" />
  return <path d="M50 72q10 8 20 0" {...common} />
}

/** มาสคอตพร้อมกล่องคำพูด */
export function MascotTip({ mood = 'idle', children, className = '' }: { mood?: Mood; children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <Mascot mood={mood} className="size-16 shrink-0 sm:size-20" />
      <div
        role="note"
        className="relative mb-2 animate-bounce-in rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-3 text-[15px] shadow-soft"
      >
        {children}
      </div>
    </div>
  )
}
