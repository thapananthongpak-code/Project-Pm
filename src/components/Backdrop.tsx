import type { CSSProperties, ReactNode } from 'react'

/** รูปทรงตกแต่งลอยช้าๆ */
function Deco({ children, className, style }: { children: ReactNode; className: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={`absolute ${className}`} style={style}>
      {children}
    </svg>
  )
}

const star = <path d="M20 3l4.5 11.5L36 19l-11.5 4.5L20 35l-4.5-11.5L4 19l11.5-4.5z" />
const ring = <circle cx="20" cy="20" r="13" fill="none" strokeWidth="5" />
const plus = <path d="M20 6v28M6 20h28" strokeWidth="7" strokeLinecap="round" />
const squiggle = <path d="M3 24c5-9 9 9 14 0s9 9 14 0s6 5 6 5" fill="none" strokeWidth="4.5" strokeLinecap="round" />

/** พื้นหลัง: วงกลมสีลอยช้าๆ ลายจุด และรูปทรงน่ารัก (ไม่รบกวนการอ่าน) */
export function Backdrop() {
  const float = (d: number, s = 9): CSSProperties => ({ animation: `float-slow ${s}s ease-in-out ${d}s infinite` })
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="dot-grid absolute inset-0 opacity-70" />
      <div className="absolute -left-24 -top-24 size-80 animate-drift rounded-full bg-brand-300/25 blur-3xl dark:bg-brand-700/25" />
      <div
        className="absolute -right-20 top-1/3 size-72 animate-drift rounded-full bg-sea-300/25 blur-3xl dark:bg-sea-700/20"
        style={{ animationDelay: '-7s' }}
      />
      <div
        className="absolute -bottom-24 left-1/4 size-80 animate-drift rounded-full bg-accent-200/30 blur-3xl dark:bg-accent-700/15"
        style={{ animationDelay: '-14s' }}
      />
      <div
        className="absolute bottom-10 right-1/4 size-56 animate-drift rounded-full bg-mint-200/30 blur-3xl dark:bg-mint-700/15"
        style={{ animationDelay: '-3s' }}
      />

      <Deco className="left-[6%] top-[18%] size-7 fill-accent-300/60" style={float(0)}>{star}</Deco>
      <Deco className="right-[8%] top-[14%] size-9 stroke-sea-300/60" style={float(2, 11)}>{ring}</Deco>
      <Deco className="left-[3%] top-[62%] size-8 stroke-mint-300/70" style={float(1, 10)}>{plus}</Deco>
      <Deco className="right-[4%] top-[70%] size-12 stroke-brand-300/60" style={float(3, 12)}>{squiggle}</Deco>
      <Deco className="hidden left-[45%] top-[8%] size-5 fill-brand-300/50 md:block" style={float(4)}>{star}</Deco>
      <Deco className="hidden left-[20%] bottom-[8%] size-6 stroke-accent-300/60 md:block" style={float(5, 10)}>{ring}</Deco>
      <Deco className="hidden right-[22%] bottom-[20%] size-5 fill-mint-300/70 md:block" style={float(1.5)}>{star}</Deco>
    </div>
  )
}
