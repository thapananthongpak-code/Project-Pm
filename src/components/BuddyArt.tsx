import type { BuddyInfo } from '../data'

export type BuddyAction = 'idle' | 'wave' | 'cheer' | 'think' | 'oops' | 'love'

const INK = '#2b2340'
const PINK = '#ff9fb8'

/** ตัวการ์ตูนผู้ช่วย วาดด้วย SVG แยกชิ้น (หู แขน ตา ปาก) ให้ขยับตามท่าทางได้ ดูแอนิเมชันที่ index.css (.buddy) */
export function BuddyArt({ buddy, action = 'idle', className = '' }: { buddy: BuddyInfo; action?: BuddyAction; className?: string }) {
  const { kind, color, dark, belly } = buddy
  const happyEyes = action === 'cheer' || action === 'love' || action === 'wave'

  return (
    <svg viewBox="0 0 120 130" className={`buddy overflow-visible ${className}`} data-action={action} aria-hidden="true">
      {/* เงาที่พื้น */}
      <ellipse cx="60" cy="125" rx="26" ry="4" fill="#000" opacity="0.08" className="b-shadow" />

      <g className="b-all">
        {/* หาง */}
        {kind === 'cat' && <path d="M86 108 q22 -4 18 -26 q-2 -8 -8 -4 q4 14 -12 22z" fill={color} stroke={dark} strokeWidth="1.5" />}
        {kind === 'dino' && <path d="M84 110 l24 -8 l-20 -10z" fill={color} stroke={dark} strokeWidth="1.5" />}
        {(kind === 'bear' || kind === 'bunny') && <circle cx="88" cy="108" r="6" fill={kind === 'bunny' ? '#fff' : color} stroke={dark} strokeWidth="1.5" />}

        {/* เท้า */}
        <ellipse cx="47" cy="119" rx="9" ry="5" fill={dark} />
        <ellipse cx="73" cy="119" rx="9" ry="5" fill={dark} />

        {/* ตัว */}
        <ellipse cx="60" cy="97" rx="30" ry="24" fill={color} stroke={dark} strokeWidth="1.5" />
        <ellipse cx="60" cy="101" rx="18" ry="15" fill={belly} />

        {/* แขน */}
        <g className="b-arm-l">
          <ellipse cx="32" cy="93" rx="7" ry="11" transform="rotate(25 32 93)" fill={color} stroke={dark} strokeWidth="1.5" />
        </g>
        <g className="b-arm-r">
          <ellipse cx="88" cy="93" rx="7" ry="11" transform="rotate(-25 88 93)" fill={color} stroke={dark} strokeWidth="1.5" />
        </g>

        {/* หู / เสาอากาศ / หนาม (อยู่หลังหัว) */}
        <g className="b-ears">
          {kind === 'cat' && (
            <>
              <path d="M31 38 L35 8 L56 26 Z" fill={color} stroke={dark} strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M89 38 L85 8 L64 26 Z" fill={color} stroke={dark} strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M37 31 L38 16 L49 26 Z" fill={PINK} />
              <path d="M83 31 L82 16 L71 26 Z" fill={PINK} />
            </>
          )}
          {kind === 'bear' && (
            <>
              <circle cx="33" cy="27" r="12" fill={color} stroke={dark} strokeWidth="1.5" />
              <circle cx="87" cy="27" r="12" fill={color} stroke={dark} strokeWidth="1.5" />
              <circle cx="33" cy="27" r="6" fill={belly} />
              <circle cx="87" cy="27" r="6" fill={belly} />
            </>
          )}
          {kind === 'bunny' && (
            <>
              <ellipse cx="45" cy="14" rx="9" ry="22" transform="rotate(-12 45 14)" fill={color} stroke={dark} strokeWidth="1.5" />
              <ellipse cx="75" cy="14" rx="9" ry="22" transform="rotate(12 75 14)" fill={color} stroke={dark} strokeWidth="1.5" />
              <ellipse cx="45" cy="15" rx="4" ry="15" transform="rotate(-12 45 15)" fill={PINK} />
              <ellipse cx="75" cy="15" rx="4" ry="15" transform="rotate(12 75 15)" fill={PINK} />
            </>
          )}
          {kind === 'robot' && (
            <>
              <line x1="60" y1="22" x2="60" y2="8" stroke={dark} strokeWidth="3" strokeLinecap="round" />
              <circle cx="60" cy="7" r="5" fill="#ffd23f" className="b-bulb" />
              <rect x="20" y="46" width="8" height="18" rx="4" fill={dark} />
              <rect x="92" y="46" width="8" height="18" rx="4" fill={dark} />
            </>
          )}
          {kind === 'dino' && (
            <>
              <path d="M40 27 L46 11 L54 24 Z" fill={dark} />
              <path d="M53 22 L60 5 L67 22 Z" fill={dark} />
              <path d="M66 24 L74 11 L80 27 Z" fill={dark} />
            </>
          )}
        </g>

        {/* หัว */}
        {kind === 'robot' ? (
          <>
            <rect x="26" y="22" width="68" height="62" rx="24" fill={color} stroke={dark} strokeWidth="1.5" />
            <rect x="34" y="34" width="52" height="40" rx="15" fill={belly} />
          </>
        ) : (
          <circle cx="60" cy="55" r="34" fill={color} stroke={dark} strokeWidth="1.5" />
        )}
        {kind === 'bear' && <ellipse cx="60" cy="66" rx="12" ry="9" fill={belly} />}

        {/* ตา */}
        {happyEyes ? (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M43 56 q5 -7 10 0" />
            <path d="M67 56 q5 -7 10 0" />
          </g>
        ) : (
          <g className="b-eyes" fill={INK}>
            <ellipse cx="48" cy={action === 'think' ? 52 : 55} rx="4.6" ry="5.4" />
            <ellipse cx="72" cy={action === 'think' ? 52 : 55} rx="4.6" ry="5.4" />
            <circle cx="49.8" cy={action === 'think' ? 50 : 53} r="1.8" fill="#fff" />
            <circle cx="73.8" cy={action === 'think' ? 50 : 53} r="1.8" fill="#fff" />
          </g>
        )}

        {/* แก้ม */}
        <ellipse cx="39" cy="65" rx="5" ry="3.2" fill={PINK} opacity={action === 'love' ? 1 : 0.7} />
        <ellipse cx="81" cy="65" rx="5" ry="3.2" fill={PINK} opacity={action === 'love' ? 1 : 0.7} />

        {/* จมูก หนวด */}
        {kind === 'cat' && (
          <>
            <path d="M58 61 h4 l-2 2.5z" fill={PINK} />
            <g stroke={dark} strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
              <path d="M28 60 l10 2M28 66 l10 -1M92 60 l-10 2M92 66 l-10 -1" />
            </g>
          </>
        )}
        {kind === 'bear' && <ellipse cx="60" cy="62" rx="3.5" ry="2.5" fill={INK} />}
        {kind === 'bunny' && <path d="M57.5 61 h5 l-2.5 3z" fill={PINK} />}

        {/* ปาก */}
        <Mouth action={action} />

        {/* ของตกแต่งตามท่า */}
        {action === 'think' && (
          <g fill={dark}>
            <circle cx="94" cy="24" r="2.5" className="b-dot" />
            <circle cx="102" cy="15" r="3.5" className="b-dot" style={{ animationDelay: '0.2s' }} />
            <circle cx="112" cy="5" r="4.5" className="b-dot" style={{ animationDelay: '0.4s' }} />
          </g>
        )}
        {action === 'oops' && <path d="M92 34 q-5 8 0 11 q5 -3 0 -11z" fill="#8fd3ff" className="b-sweat" />}
        {action === 'cheer' && (
          <g fill="#ffd23f">
            <path d="M16 36 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" className="b-sparkle" />
            <path d="M104 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" className="b-sparkle" style={{ animationDelay: '0.3s' }} />
          </g>
        )}
        {action === 'love' && (
          <g fill="#ff6f91">
            <path d="M98 30 c-4 -6 -12 -1 -6 6 l6 6 6 -6 c6 -7 -2 -12 -6 -6z" className="b-heart" />
            <path d="M22 38 c-3 -5 -9 -1 -5 4 l5 5 5 -5 c4 -5 -2 -9 -5 -4z" className="b-heart" style={{ animationDelay: '0.5s' }} />
          </g>
        )}
      </g>
    </svg>
  )
}

function Mouth({ action }: { action: BuddyAction }) {
  const line = { stroke: INK, strokeWidth: 2.5, strokeLinecap: 'round' as const, fill: 'none' }
  switch (action) {
    case 'cheer':
    case 'love':
      return (
        <g>
          <path d="M51 67 q9 12 18 0z" fill={INK} />
          <ellipse cx="60" cy="72" rx="4" ry="2.2" fill={PINK} />
        </g>
      )
    case 'wave':
      return <path d="M52 67 q8 8 16 0" {...line} />
    case 'think':
      return <path d="M56 70 h8" {...line} />
    case 'oops':
      return <path d="M52 71 q4 -4 8 0 q4 4 8 0" {...line} />
    default:
      return <path d="M54 68 q6 5 12 0" {...line} />
  }
}
