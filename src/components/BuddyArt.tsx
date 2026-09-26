import type { BuddyInfo } from '../data'
import type { Equipped } from '../lib/game'
import { FaceItem, HeadItem, NeckItem } from './BuddyOutfit'

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
  // ท่าพิเศษของตัวละครพิเศษ
  | 'rainbow'
  | 'fly'
  | 'fire'
  | 'magic'
export type BuddyAction = EventAction | MoveAction

export const ALL_ACTIONS: BuddyAction[] = [
  'idle', 'wave', 'cheer', 'think', 'oops', 'love',
  'hop', 'dance', 'spin', 'stretch', 'look', 'shy', 'sleep', 'nod',
  'tailwag', 'hug', 'earflop', 'scan', 'beep', 'roar',
  'rainbow', 'fly', 'fire', 'magic',
]

const INK = '#2b2340'
const PINK = '#ff9fb8'

type Eyes = 'open' | 'happy' | 'closed' | 'up'
const eyesFor: Partial<Record<BuddyAction, Eyes>> = {
  cheer: 'happy', love: 'happy', wave: 'happy', dance: 'happy', shy: 'happy', hug: 'happy', stretch: 'happy', roar: 'happy',
  rainbow: 'happy', magic: 'happy', fire: 'happy',
  sleep: 'closed',
  think: 'up',
}

/** ตัวการ์ตูนผู้ช่วย วาดด้วย SVG แยกชิ้น (หาง หูซ้าย/ขวา แขน ตา ปาก) ขยับตามท่า ดูแอนิเมชันที่ index.css (.buddy) */
export function BuddyArt({
  buddy,
  action = 'idle',
  outfit = {},
  className = '',
}: {
  buddy: BuddyInfo
  action?: BuddyAction
  /** ของแต่งตัวที่ใส่อยู่ */
  outfit?: Equipped
  className?: string
}) {
  const { kind, color, dark, belly, special } = buddy
  const eyes = eyesFor[action] ?? 'open'
  const stroke = { stroke: dark, strokeWidth: 1.5 }

  return (
    <svg viewBox="0 0 120 130" className={`buddy overflow-visible ${className}`} data-action={action} data-kind={kind} aria-hidden="true">
      <ellipse cx="60" cy="125" rx="26" ry="4" fill="#000" opacity="0.08" className="b-shadow" />
      {special && (
        <>
          <defs>
            <radialGradient id={`aura-${kind}`}>
              <stop offset="0" stopColor={dark} stopOpacity="0.45" />
              <stop offset="0.6" stopColor={color} stopOpacity="0.25" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="horn-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff7c2" />
              <stop offset="1" stopColor="#ffc21a" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="72" r="58" fill={`url(#aura-${kind})`} className="b-aura" />
        </>
      )}

      <g className="b-all">
        {/* หาง */}
        <g className="b-tail">
          {kind === 'cat' && <path d="M86 108 q22 -4 18 -26 q-2 -8 -8 -4 q4 14 -12 22z" fill={color} {...stroke} />}
          {kind === 'dino' && <path d="M84 110 l24 -8 l-20 -10z" fill={color} {...stroke} />}
          {(kind === 'bear' || kind === 'bunny') && (
            <circle cx="88" cy="108" r="6" fill={kind === 'bunny' ? '#fff' : color} {...stroke} />
          )}
          {kind === 'unicorn' && (
            <>
              <circle cx="104" cy="86" r="5.5" fill="#ffd166" />
              <circle cx="100" cy="96" r="6.5" fill="#8fc9ff" />
              <circle cx="92" cy="105" r="7.5" fill="#c4a1ff" />
            </>
          )}
          {kind === 'dragon' && (
            <>
              <path d="M84 110q18 4 23-13" stroke={dark} strokeWidth="9" strokeLinecap="round" fill="none" />
              <path d="M84 110q18 4 23-13" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M104 99l9-8-1 12z" fill={dark} />
            </>
          )}
          {kind === 'fox' && (
            <>
              <path d="M84 112C114 112 120 78 100 66C106 84 98 98 84 100Z" fill={color} {...stroke} />
              <path d="M100 66C112 70 116 80 114 90C108 84 104 78 100 66Z" fill="#fff" />
            </>
          )}
        </g>

        {kind === 'dragon' && (
          <>
            <g className="b-wing-l">
              <path d="M36 90C16 72 4 84 8 98C14 92 20 96 24 102C28 96 32 98 36 100Z" fill={color} stroke={dark} strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M34 92L14 82M31 96L18 94" stroke={dark} strokeWidth="1.2" opacity="0.5" />
            </g>
            <g className="b-wing-r">
              <path d="M84 90C104 72 116 84 112 98C106 92 100 96 96 102C92 96 88 98 84 100Z" fill={color} stroke={dark} strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M86 92L106 82M89 96L102 94" stroke={dark} strokeWidth="1.2" opacity="0.5" />
            </g>
          </>
        )}

        {/* เท้า */}
        <ellipse cx="47" cy="119" rx="9" ry="5" fill={dark} className="b-foot-l" />
        <ellipse cx="73" cy="119" rx="9" ry="5" fill={dark} className="b-foot-r" />

        {/* ตัว */}
        <ellipse cx="60" cy="97" rx="30" ry="24" fill={color} {...stroke} />
        <ellipse cx="60" cy="101" rx="18" ry="15" fill={belly} />
        {kind === 'dragon' && (
          <path d="M46 94q14 5 28 0M45 102q15 5 30 0M48 110q12 4 24 0" stroke={dark} strokeWidth="1.5" opacity="0.25" fill="none" />
        )}

        {/* แขน */}
        <g className="b-arm-l">
          <ellipse cx="32" cy="93" rx="7" ry="11" transform="rotate(25 32 93)" fill={color} {...stroke} />
        </g>
        <g className="b-arm-r">
          <ellipse cx="88" cy="93" rx="7" ry="11" transform="rotate(-25 88 93)" fill={color} {...stroke} />
        </g>

        <NeckItem id={outfit.neck} />

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
          {kind === 'unicorn' && (
            <>
              {/* แผงคอสีรุ้ง */}
              <circle cx="80" cy="28" r="9" fill="#ff9fb8" />
              <circle cx="90" cy="38" r="9" fill="#ffd166" />
              <circle cx="95" cy="51" r="8.5" fill="#8be0a4" />
              <circle cx="95" cy="64" r="8" fill="#8fc9ff" />
              <circle cx="90" cy="76" r="7" fill="#c4a1ff" />
              <g className="b-ear-l">
                <ellipse cx="41" cy="24" rx="6.5" ry="13" transform="rotate(-22 41 24)" fill={color} {...stroke} />
                <ellipse cx="41" cy="25" rx="3" ry="8" transform="rotate(-22 41 25)" fill={PINK} />
              </g>
              <g className="b-ear-r">
                <ellipse cx="77" cy="22" rx="6.5" ry="13" transform="rotate(22 77 22)" fill={color} {...stroke} />
                <ellipse cx="77" cy="23" rx="3" ry="8" transform="rotate(22 77 23)" fill={PINK} />
              </g>
            </>
          )}
          {kind === 'dragon' && (
            <>
              <path d="M42 28q-6-14 3-20q-2 10 4 16z" fill="#fef3c7" {...stroke} strokeLinejoin="round" />
              <path d="M78 28q6-14-3-20q2 10-4 16z" fill="#fef3c7" {...stroke} strokeLinejoin="round" />
            </>
          )}
          {kind === 'fox' && (
            <>
              <g className="b-ear-l">
                <path d="M30 42L32 4L56 26Z" fill={color} {...stroke} strokeLinejoin="round" />
                <path d="M35 34L36 14L49 26Z" fill="#fff" />
              </g>
              <g className="b-ear-r">
                <path d="M90 42L88 4L64 26Z" fill={color} {...stroke} strokeLinejoin="round" />
                <path d="M85 34L84 14L71 26Z" fill="#fff" />
              </g>
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
        {kind === 'unicorn' && (
          <>
            <circle cx="47" cy="25" r="7" fill="#c4a1ff" />
            <circle cx="39" cy="31" r="5.5" fill="#8fc9ff" />
            <g className="b-horn">
              <path d="M60 -1L54.5 25Q60 28 65.5 25Z" fill="url(#horn-gold)" stroke="#e0a800" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M56 19L64.5 16M57.2 12L63.4 9.8M58.3 6L62 4.6" stroke="#e0a800" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          </>
        )}
        {kind === 'fox' && (
          <>
            <ellipse cx="60" cy="68" rx="17" ry="11" fill={belly} />
            <ellipse cx="60" cy="62.5" rx="3.2" ry="2.3" fill={INK} />
            <path d="M0-6l1.8 3.8 4.2.6-3 2.9.7 4.2L0 3.5l-3.7 2 .7-4.2-3-2.9 4.2-.6z" transform="translate(60 36) scale(0.95)" fill="#fff7c2" stroke="#facc15" strokeWidth="1" className="b-mark" />
          </>
        )}

        <HeadItem id={outfit.head} />

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

        <FaceItem id={outfit.face} />

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

      {special && (
        <g className="b-orbit" fill="#fff" stroke={dark} strokeWidth="0.6">
          {[-90, 30, 150].map((a) => {
            const r = (a * Math.PI) / 180
            return (
              <path
                key={a}
                d="M0-4.5l1.2 3.3 3.3 1.2-3.3 1.2L0 4.5-1.2 1.2-4.5 0-1.2-1.2z"
                transform={`translate(${60 + Math.cos(r) * 54} ${72 + Math.sin(r) * 54})`}
              />
            )
          })}
        </g>
      )}
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
    case 'rainbow':
    case 'magic':
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
    case 'fire':
      return <ellipse cx="62" cy="70" rx="4.5" ry="4" fill={INK} />
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
    case 'fly':
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
    case 'rainbow':
      return (
        <g className="b-rainbow" fill="none" strokeWidth="4.5" strokeLinecap="round">
          <path d="M16 36A44 44 0 0 1 104 36" stroke="#ff6f91" />
          <path d="M21 36A39 39 0 0 1 99 36" stroke="#ffd166" />
          <path d="M26 36A34 34 0 0 1 94 36" stroke="#8be0a4" />
          <path d="M31 36A29 29 0 0 1 89 36" stroke="#8fc9ff" />
          <path d="M36 36A24 24 0 0 1 84 36" stroke="#c4a1ff" />
        </g>
      )
    case 'fire':
      return (
        <g>
          <circle cx="76" cy="70" r="4" fill="#ffb347" className="b-fire" />
          <circle cx="84" cy="66" r="5" fill="#ff7a45" className="b-fire" style={{ animationDelay: '0.15s' }} />
          <circle cx="94" cy="61" r="6.5" fill="#ffd166" className="b-fire" style={{ animationDelay: '0.3s' }} />
          <circle cx="104" cy="55" r="5" fill="#ffe8a3" className="b-fire" style={{ animationDelay: '0.45s' }} />
        </g>
      )
    case 'magic':
      return (
        <g className="b-magic" fill="#fde047" stroke="#f59e0b" strokeWidth="0.8">
          {[0, 90, 180, 270].map((a) => {
            const r = (a * Math.PI) / 180
            return (
              <path
                key={a}
                d="M0-6l1.6 4.4L6 0 1.6 1.6 0 6-1.6 1.6-6 0-1.6-1.6z"
                transform={`translate(${60 + Math.cos(r) * 56} ${70 + Math.sin(r) * 56})`}
              />
            )
          })}
        </g>
      )
    case 'fly':
      return (
        <g stroke={dark} strokeWidth="2" strokeLinecap="round" opacity="0.4" className="b-wind">
          <path d="M40 128h10M56 131h9M71 128h10" />
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
