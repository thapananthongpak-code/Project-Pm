/**
 * ของแต่งตัวผู้ช่วย วาดทับบน BuddyArt (พิกัดเดียวกัน viewBox 0 0 120 130)
 * หัวอยู่ที่ (60, 55) รัศมี 34 · ตาอยู่ที่ (48, 55) และ (72, 55) · ใต้คางราว y = 88
 */

const heartPath = 'M0 7C-10 0-10-9-3-8C0-8 0-5 0-4C0-5 0-8 3-8C10-9 10 0 0 7Z'
const starPath = 'M0-6l1.8 3.8 4.2.6-3 2.9.7 4.2L0 3.5l-3.7 2 .7-4.2-3-2.9 4.2-.6z'

export function HeadItem({ id }: { id?: string }) {
  switch (id) {
    case 'bow':
      return (
        <g transform="translate(82 26) rotate(15)">
          <path d="M0 0C-10-10-17 0-11 6C-7 9-2 4 0 0Z" fill="#ff8fb3" stroke="#e0487a" strokeWidth="1.2" />
          <path d="M0 0C10-10 17 0 11 6C7 9 2 4 0 0Z" fill="#ff8fb3" stroke="#e0487a" strokeWidth="1.2" />
          <circle r="3.4" fill="#e0487a" />
        </g>
      )
    case 'flower':
      return (
        <g transform="translate(84 29)">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 5.5} cy={Math.sin((a * Math.PI) / 180) * 5.5} r="4.6" fill="#ffd6e7" stroke="#f08db0" strokeWidth="1" />
          ))}
          <circle r="3.6" fill="#ffd23f" stroke="#e0a800" strokeWidth="1" />
        </g>
      )
    case 'party-hat':
      return (
        <g transform="rotate(-12 60 22)">
          <path d="M47 24L60-8L73 24Z" fill="#7856ff" stroke="#4d2fd0" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M53.5 8H66.5L68.3 13H51.7Z" fill="#ffd23f" />
          <path d="M49.2 19H70.8L72 22H48Z" fill="#ff8a3d" />
          <circle cx="60" cy="-9" r="4" fill="#ff6f91" />
        </g>
      )
    case 'beanie':
      return (
        <g>
          <path d="M27 43C27 12 93 12 93 43Z" fill="#4fa6ff" stroke="#1558c0" strokeWidth="1.2" />
          <path d="M25 40Q60 29 95 40L95 47Q60 36 25 47Z" fill="#ffd23f" stroke="#e0a800" strokeWidth="1" />
          <circle cx="60" cy="12" r="6" fill="#fff" stroke="#c9d6ff" strokeWidth="1" />
        </g>
      )
    case 'grad-cap':
      return (
        <g>
          <path d="M42 24V32Q60 40 78 32V24Z" fill="#3a3155" />
          <path d="M26 20L60 7L94 20L60 33Z" fill="#2b2340" stroke="#1a1530" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="60" cy="20" r="2" fill="#ffd23f" />
          <path d="M60 20L88 25V37" stroke="#ffd23f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <rect x="85.5" y="36" width="5" height="7" rx="1.5" fill="#ffd23f" />
        </g>
      )
    case 'crown':
      return (
        <g>
          <path d="M42 28L39 9L50 18L60 5L70 18L81 9L78 28Z" fill="#ffd23f" stroke="#e0a800" strokeWidth="1.3" strokeLinejoin="round" />
          <circle cx="60" cy="21" r="2.8" fill="#ff6f91" />
          <circle cx="49" cy="23" r="2.1" fill="#4fa6ff" />
          <circle cx="71" cy="23" r="2.1" fill="#34c48a" />
        </g>
      )
    default:
      return null
  }
}

export function FaceItem({ id }: { id?: string }) {
  switch (id) {
    case 'round-glasses':
      return (
        <g fill="rgb(255 255 255 / 0.18)" stroke="#5b4636" strokeWidth="2.2">
          <circle cx="48" cy="55" r="9" />
          <circle cx="72" cy="55" r="9" />
          <path d="M57 54q3-3 6 0M39 53l-10-3M81 53l10-3" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'heart-glasses':
      return (
        <g>
          <path d={heartPath} transform="translate(48 55) scale(1.35)" fill="rgb(255 111 145 / 0.75)" stroke="#e0487a" strokeWidth="1" />
          <path d={heartPath} transform="translate(72 55) scale(1.35)" fill="rgb(255 111 145 / 0.75)" stroke="#e0487a" strokeWidth="1" />
          <path d="M57 53q3-2 6 0" stroke="#e0487a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'sunglasses':
      return (
        <g>
          <rect x="37" y="49" width="21" height="12" rx="5.5" fill="#2b2340" />
          <rect x="62" y="49" width="21" height="12" rx="5.5" fill="#2b2340" />
          <rect x="57" y="52" width="6" height="2.5" rx="1.2" fill="#2b2340" />
          <path d="M41 52l5 0M66 52l5 0" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )
    default:
      return null
  }
}

export function NeckItem({ id }: { id?: string }) {
  switch (id) {
    case 'bowtie':
      return (
        <g>
          <path d="M60 93L48 86V100Z" fill="#ff6f91" stroke="#e0487a" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M60 93L72 86V100Z" fill="#ff6f91" stroke="#e0487a" strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="60" cy="93" r="3.2" fill="#e0487a" />
        </g>
      )
    case 'scarf':
      return (
        <g>
          <path d="M33 83Q60 99 87 83L87 91Q60 107 33 91Z" fill="#ff8a3d" stroke="#d95a0a" strokeWidth="1.2" />
          <path d="M69 95L78 94L81 112L71 112Z" fill="#ff8a3d" stroke="#d95a0a" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M72 101h7M72.5 106h7.5" stroke="#ffd23f" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )
    case 'star-necklace':
      return (
        <g>
          <path d="M43 86Q60 101 77 86" stroke="#e0a800" strokeWidth="1.6" fill="none" />
          <path d={starPath} transform="translate(60 99) scale(1.25)" fill="#ffd23f" stroke="#e0a800" strokeWidth="0.9" />
        </g>
      )
    default:
      return null
  }
}
