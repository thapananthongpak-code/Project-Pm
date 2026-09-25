import { badges } from '../data'
import { BadgeIcon } from './BadgeIcon'
import { StarIcon, useGame } from './Game'

/** ชั้นวางเหรียญ: เหรียญที่ยังไม่ได้เป็นสีเทา */
export function BadgeShelf() {
  const { game } = useGame()
  const earned = badges.filter((b) => game.badges.includes(b.id)).length

  return (
    <div>
      <p className="flex items-center justify-between font-semibold">
        <span>
          เหรียญของฉัน {earned}/{badges.length}
        </span>
        <span className="flex items-center gap-1 text-accent-700 dark:text-accent-300">
          <StarIcon className="size-5" />
          {game.stars} ดาว
        </span>
      </p>
      <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {badges.map((b, i) => {
          const has = game.badges.includes(b.id)
          return (
            <li
              key={b.id}
              className="flex animate-fly-in flex-col items-center text-center"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <BadgeIcon part={b.color} locked={!has} className={`size-16 ${has ? 'animate-wiggle' : ''}`} />
              <span className={`mt-1 text-sm font-semibold ${has ? '' : 'text-muted'}`}>{b.name}</span>
              <span className="text-xs text-muted">{b.desc}</span>
              <span className="sr-only">{has ? 'ได้แล้ว' : 'ยังไม่ได้'}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
