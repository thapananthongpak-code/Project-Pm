import type { BuddyInfo } from '../data'

/** ท่าตามสถานการณ์ (event/state) */
export type EventAction = 'idle' | 'wave' | 'cheer' | 'think' | 'oops' | 'love'
/** ท่าที่ทำเองตอนว่าง หรือเมื่อถูกแตะ */
export type MoveAction =
  | 'hop'
  | 'dance'
  | 'spin'
  | 'stretch'
  | 'look'
  | 'shy'
  | 'sleep'
  | 'nod'
  // ท่าประจำตัว
  | 'tailwag'
  | 'hug'
  | 'earflop'
  | 'scan'
  | 'beep'
  | 'roar'
export type BuddyAction = EventAction | MoveAction

export const ALL_ACTIONS: BuddyAction[] = [
  'idle', 'wave', 'cheer', 'think', 'oops', 'love',
  'hop', 'dance', 'spin', 'stretch', 'look', 'shy', 'sleep', 'nod',
  'tailwag', 'hug', 'earflop', 'scan', 'beep', 'roar',
]

const INK = '#2b2340'
const PINK = '#ff9fb8'

type Eyes = 'open' | 'happy' | 'closed' | 'up'
const eyesFor: Partial<Record<BuddyAction, Eyes>> = {
  cheer: 'happy', love: 'happy', wave: 'happy', dance: 'happy', shy: 'happy', hug: 'happy', stretch: 'happy', roar: 'happy',
  sleep: 'closed',
  think: 'up',
}

/** ตัวการ์ตูนผู้ช่วย วาดด้วย SVG แยกชิ้น (หาง หูซ้าย/ขวา แขน ตา ปาก) ขยับตามท่า ดูแอนิเมชันที่ index.css (.buddy) */
export function BuddyArt({ buddy, action = 'idle', className = '' }: { buddy: BuddyInfo; action?: BuddyAction; className?: string }) {
  const { kind, color, dark, belly } = buddy
  const eyes = eyesFor[action] ?? 'open'
  const stroke = { stroke: dark, strokeWidth: 1.5 }

  return (
    <svg viewBox="0 0 120 130" className={`buddy overflow-visible ${className}`} data-action={action} data-kind={kind} aria-hidden="true">
      <ellipse cx="60" cy="125" rx="26" ry="4" fill="#000" opacity="0.08" className="b-shadow" />

      <g className="b-all">
        {/* หาง */}
        <g className="b-tail">
          {kind === 'cat' && <path d="M86 108 q22 -4 18 -26 q-2 -8 -8 -4 q4 14 -12 22z" fill={color} {...stroke} />}
          {kind === 'dino' && <path d="M84 110 l24 -8 l-20 -10z" fill={color} {...stroke} />}
          {(kind === 'bear' || kind === 'bunny') && (
            <circle cx="88" cy="108" r="6" fill={kind === 'bunny' ? '#fff' : color} {...stroke} />
          )}
        </g>

        {/* เท้า */}
        <ellipse cx="47" cy="119" rx="9" ry="5" fill={dark} className="b-foot-l" />
        <ellipse cx="73" cy="119" rx="9" ry="5" fill={dark} className="b-foot-r" />

        {/* ตัว */}
        <ellipse cx="60" cy="97" rx="30" ry="24" fill={color} {...stroke} />
        <ellipse cx="60" cy="101" rx="18" ry="15" fill={belly} />

        {/* แขน */}
        <g className="b-arm-l">
          <ellipse cx="32" cy="93" rx="7" ry="11" transform="rotate(25 32 93)" fill={color} {...stroke} />
        </g>
        <g className="b-arm-r">
          <ellipse cx="88" cy="93" rx="7" ry="11" transform="rotate(-25 88 93)" fill={color} {...stroke} />
        </g>

        {/* หู / เสาอากาศ / หนาม (อยู่หลังหัว) */}
        <g className="b-ears">
          {kind === 'cat' && (
            <>
              <g className="b-ear-l">
                <path d="M31 38 L35 8 L56 26 Z" fill={color} {...stroke} strokeLinejoin="round" />
                <path d="M37 31 L38 16 L49 26 Z" fill={PINK} />
              </g>
              <g className="b-ear-r">
                <path d="M89 38 L85 8 L64 26 Z" fill={color} {...stroke} strokeLinejoin="round" />
                <path d="M83 31 L82 16 L71 26 Z" fill={PINK} />
              </g>
            </>
          )}
          {kind === 'bear' && (
            <>
              <g className="b-ear-l">
                <circle cx="33" cy="27" r="12" fill={color} {...stroke} />
                <circle cx="33" cy="27" r="6" fill={belly} />
              </g>
              <g className="b-ear-r">
                <circle cx="87" cy="27" r="12" fill={color} {...stroke} />
                <circle cx="87" cy="27" r="6" fill={belly} />
              </g>
            </>
          )}
          {kind === 'bunny' && (
            <>
              <g className="b-ear-l">
                <ellipse cx="45" cy="14" rx="9" ry="22" transform="rotate(-12 45 14)" fill={color} {...stroke} />
                <ellipse cx="45" cy="15" rx="4" ry="15" transform="rotate(-12 45 15)" fill={PINK} />
              </g>
              <g className="b-ear-r">
                <ellipse cx="75" cy="14" rx="9" ry="22" transform="rotate(12 75 14)" fill={color} {...stroke} />
                <ellipse cx="75" cy="15" rx="4" ry="15" transform="rotate(12 75 15)" fill={PINK} />
              </g>
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
            <g className="b-spikes">
              <path d="M40 27 L46 11 L54 24 Z" fill={dark} />
              <path d="M53 22 L60 5 L67 22 Z" fill={dark} />
              <path d="M66 24 L74 11 L80 27 Z" fill={dark} />
            </g>
          )}
        </g>

        {/* หัว */}
        {kind === 'robot' ? (
          <>
            <rect x="26" y="22" width="68" height="62" rx="24" fill={color} {...stroke} />
            <rect x="34" y="34" width="52" height="40" rx="15" fill={belly} />
            <rect x="36" y="36" width="48" height="3" rx="1.5" fill="#8fd3ff" className="b-scan" />
          </>
        ) : (
          <circle cx="60" cy="55" r="34" fill={color} {...stroke} />
        )}
        {kind === 'bear' && <ellipse cx="60" cy="66" rx="12" ry="9" fill={belly} />}

        {/* ตา */}
        {eyes === 'happy' && (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M43 56 q5 -7 10 0" />
            <path d="M67 56 q5 -7 10 0" />
          </g>
        )}
        {eyes === 'closed' && (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M43 55 q5 4 10 0" />
            <path d="M67 55 q5 4 10 0" />
          </g>
        )}
        {(eyes === 'open' || eyes === 'up') && (
          <g className="b-eyes" fill={INK}>
            <ellipse cx="48" cy={eyes === 'up' ? 52 : 55} rx="4.6" ry="5.4" />
            <ellipse cx="72" cy={eyes === 'up' ? 52 : 55} rx="4.6" ry="5.4" />
            <g className="b-pupils" fill="#fff">
              <circle cx="49.8" cy={eyes === 'up' ? 50 : 53} r="1.8" />
              <circle cx="73.8" cy={eyes === 'up' ? 50 : 53} r="1.8" />
            </g>
          </g>
        )}

        {/* แก้ม */}
        <g className="b-cheeks">
          <ellipse cx="39" cy="65" rx="5" ry="3.2" fill={PINK} />
          <ellipse cx="81" cy="65" rx="5" ry="3.2" fill={PINK} />
          {action === 'shy' && (
            <g stroke="#ff6f91" strokeWidth="1.2" strokeLinecap="round">
              <path d="M36 63 l2 3M40 63 l2 3M78 63 l2 3M82 63 l2 3" />
            </g>
          )}
        </g>

        {/* จมูก หนวด */}
        {kind === 'cat' && (
          <>
            <path d="M58 61 h4 l-2 2.5z" fill={PINK} />
            <g stroke={dark} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" className="b-whiskers">
              <path d="M28 60 l10 2M28 66 l10 -1M92 60 l-10 2M92 66 l-10 -1" />
            </g>
          </>
        )}
        {kind === 'bear' && <ellipse cx="60" cy="62" rx="3.5" ry="2.5" fill={INK} />}
        {kind === 'bunny' && <path d="M57.5 61 h5 l-2.5 3z" fill={PINK} />}

        <Mouth action={action} />

        {/* ของตกแต่งตามท่า */}
        <Extras action={action} dark={dark} />
      </g>
    </svg>
  )
}

function Mouth({ action }: { action: BuddyAction }) {
  const line = { stroke: INK, strokeWidth: 2.5, strokeLinecap: 'round' as const, fill: 'none' }
  switch (action) {
    case 'cheer':
    case 'love':
    case 'hug':
    case 'dance':
      return (
        <g>
          <path d="M51 67 q9 12 18 0z" fill={INK} />
          <ellipse cx="60" cy="72" rx="4" ry="2.2" fill={PINK} />
        </g>
      )
    case 'roar':
      return (
        <g className="b-roar-mouth">
          <ellipse cx="60" cy="71" rx="9" ry="7" fill={INK} />
          <path d="M53 66 l2.5 3.5 2.5 -3.5M62 66 l2.5 3.5 2.5 -3.5" fill="#fff" />
          <ellipse cx="60" cy="75" rx="4.5" ry="2" fill={PINK} />
        </g>
      )
    case 'stretch':
    case 'sleep':
      return <ellipse cx="60" cy="70" rx="3" ry={action === 'stretch' ? 4 : 2.2} fill={INK} />
    case 'think':
      return <path d="M56 70 h8" {...line} />
    case 'oops':
      return <path d="M52 71 q4 -4 8 0 q4 4 8 0" {...line} />
    case 'shy':
      return <path d="M55 69 q2.5 2 5 0 q2.5 2 5 0" {...line} />
    case 'wave':
    case 'hop':
    case 'spin':
    case 'tailwag':
      return <path d="M52 67 q8 8 16 0" {...line} />
    default:
      return <path d="M54 68 q6 5 12 0" {...line} />
  }
}

function Extras({ action, dark }: { action: BuddyAction; dark: string }) {
  switch (action) {
    case 'think':
      return (
        <g fill={dark}>
          <circle cx="94" cy="24" r="2.5" className="b-dot" />
          <circle cx="102" cy="15" r="3.5" className="b-dot" style={{ animationDelay: '0.2s' }} />
          <circle cx="112" cy="5" r="4.5" className="b-dot" style={{ animationDelay: '0.4s' }} />
        </g>
      )
    case 'oops':
      return <path d="M92 34 q-5 8 0 11 q5 -3 0 -11z" fill="#8fd3ff" className="b-sweat" />
    case 'cheer':
      return (
        <g fill="#ffd23f">
          <path d="M16 36 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" className="b-sparkle" />
          <path d="M104 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" className="b-sparkle" style={{ animationDelay: '0.3s' }} />
        </g>
      )
    case 'love':
    case 'hug':
      return (
        <g fill="#ff6f91">
          <path d="M98 30 c-4 -6 -12 -1 -6 6 l6 6 6 -6 c6 -7 -2 -12 -6 -6z" className="b-heart" />
          <path d="M22 38 c-3 -5 -9 -1 -5 4 l5 5 5 -5 c4 -5 -2 -9 -5 -4z" className="b-heart" style={{ animationDelay: '0.5s' }} />
        </g>
      )
    case 'sleep':
      return (
        <g fill={dark} fontFamily="Prompt, sans-serif" fontWeight="700">
          <text x="88" y="30" fontSize="11" className="b-z">z</text>
          <text x="96" y="20" fontSize="14" className="b-z" style={{ animationDelay: '0.7s' }}>z</text>
          <text x="105" y="8" fontSize="17" className="b-z" style={{ animationDelay: '1.4s' }}>Z</text>
        </g>
      )
    case 'dance':
      return (
        <g fill={dark}>
          <path d="M14 30 v12 a3 3 0 1 1 -2 -2.8 v-12 l9 -2 v4z" className="b-note" />
          <path d="M102 26 v12 a3 3 0 1 1 -2 -2.8 v-12 l9 -2 v4z" className="b-note" style={{ animationDelay: '0.6s' }} />
        </g>
      )
    case 'roar':
      return (
        <g stroke={dark} strokeWidth="2.5" strokeLinecap="round" fill="none" className="b-roar">
          <path d="M20 62 q-6 6 0 12M13 58 q-9 10 0 20" />
          <path d="M100 62 q6 6 0 12M107 58 q9 10 0 20" />
        </g>
      )
    case 'beep':
      return (
        <g stroke="#ffd23f" strokeWidth="2.5" strokeLinecap="round" fill="none" className="b-signal">
          <path d="M50 4 q10 -8 20 0" />
          <path d="M45 -2 q15 -12 30 0" />
        </g>
      )
    case 'spin':
    case 'hop':
      return (
        <g fill="#ffd23f" opacity="0.9">
          <circle cx="24" cy="112" r="2" className="b-sparkle" />
          <circle cx="98" cy="110" r="2.5" className="b-sparkle" style={{ animationDelay: '0.2s' }} />
        </g>
      )
    default:
      return null
  }
}
