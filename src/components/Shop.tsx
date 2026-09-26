import { useState } from 'react'
import { buddies, shopItems, type BuddyInfo } from '../data'
import { celebrate } from '../lib/confetti'
import {
  buddyItemId,
  FULL_PROMPTS_PER_DAY,
  FULL_ROUNDS_PER_DAY,
  MISSION_COINS,
  MISSION_COINS_TIRED,
  PERFECT_BONUS,
  quizCoins,
  type Equipped,
  type ShopItem,
  type ShopSlot,
  type Slot,
} from '../lib/game'
import { LivelyBuddy, useBuddy } from './Buddy'
import { BuddyArt } from './BuddyArt'
import { CoinIcon, useGame } from './Game'
import { useToast } from './Toast'

const slots: { id: ShopSlot; label: string }[] = [
  { id: 'buddy', label: 'ตัวละครพิเศษ' },
  { id: 'head', label: 'หมวก' },
  { id: 'face', label: 'แว่นตา' },
  { id: 'neck', label: 'ของคล้องคอ' },
]

/** ลองใส่: ช่องไหนมีค่า = แทนของที่ใส่อยู่ (null = ถอด) */
type TryOn = Partial<Record<Slot, string | null>>

function withTryOn(equipped: Equipped, tryOn: TryOn): Equipped {
  const out: Equipped = { ...equipped }
  for (const s of Object.keys(tryOn) as Slot[]) {
    const v = tryOn[s]
    if (v === null) delete out[s]
    else if (v) out[s] = v
  }
  return out
}

/** ร้านค้า: ใช้เหรียญซื้อของแต่งตัวให้ผู้ช่วย ลองใส่ก่อนซื้อได้ */
export function Shop() {
  const { game, buy, equip } = useGame()
  const { buddy } = useBuddy()
  const notify = useToast()
  const [slot, setSlot] = useState<ShopSlot>('buddy')
  const [tryOn, setTryOn] = useState<TryOn>({})
  const [party, setParty] = useState(0)
  const preview = withTryOn(game.equipped, tryOn)
  const trying = Object.keys(tryOn).length > 0

  function clearTry(s: Slot) {
    setTryOn(({ [s]: _removed, ...rest }) => rest)
  }

  function onBuy(item: ShopItem & { slot: Slot }) {
    if (!buy(item)) return
    clearTry(item.slot)
    setParty((n) => n + 1)
    celebrate('small')
    notify(`ซื้อ${item.name}แล้ว! ใส่ให้ผู้ช่วยเรียบร้อย`)
  }

  const items = shopItems.filter((i) => i.slot === slot) as (ShopItem & { slot: Slot })[]

  return (
    <section aria-labelledby="page-heading" className="animate-step-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="page-heading" className="text-2xl font-bold lg:text-3xl">
            ร้านค้า
          </h1>
          <p className="text-muted">ใช้เหรียญปลดล็อกตัวละครพิเศษ และซื้อของแต่งตัวให้ผู้ช่วย (แตะที่ของเพื่อลองใส่ก่อนได้)</p>
        </div>
        <p className="flex items-center gap-2 rounded-2xl bg-linear-to-r from-[#ffd23f] to-accent-300 px-4 py-2 text-lg font-bold text-[#3b2400] shadow-soft">
          <CoinIcon className="size-7" />
          {game.coins} เหรียญ
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        {/* เวทีโชว์ผู้ช่วย */}
        <div className="card deco-card flex flex-col items-center p-5 lg:sticky lg:top-24">
          <LivelyBuddy key={party} action={party ? 'cheer' : 'wave'} outfit={preview} className="size-44 sm:size-52" label="แตะเล่นกับผู้ช่วย" />
          <div className="mt-3 h-10 text-center">
            {trying ? (
              <p className="flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="rounded-full bg-sea-100 px-3 py-1 font-semibold text-sea-700 dark:bg-sea-700/30 dark:text-sea-200">
                  กำลังลองใส่
                </span>
                <button type="button" onClick={() => setTryOn({})} className="min-h-9 rounded-xl font-semibold underline underline-offset-4">
                  เลิกลอง
                </button>
              </p>
            ) : (
              <p className="text-sm text-muted">นี่คือชุดที่ผู้ช่วยใส่อยู่ {buddy.ending}</p>
            )}
          </div>
        </div>

        <div>
          {/* หมวดของ */}
          <div role="tablist" aria-label="หมวดของ" className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={slot === s.id}
                onClick={() => setSlot(s.id)}
                className={`min-h-11 rounded-full border-2 px-4 font-semibold transition active:scale-95 ${
                  slot === s.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-surface hover:border-brand-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {slot === 'buddy' ? (
            <SpecialBuddies onBought={() => setParty((n) => n + 1)} />
          ) : (
          <ul role="tabpanel" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item, i) => {
              const owned = game.owned.includes(item.id)
              const wearing = game.equipped[item.slot] === item.id
              const previewing = tryOn[item.slot] === item.id
              const short = item.price - game.coins
              return (
                <li
                  key={item.id}
                  className={`card flex animate-fly-in flex-col items-center p-3 text-center transition ${
                    previewing ? 'ring-2 ring-sea-500' : wearing ? 'ring-2 ring-brand-500' : ''
                  }`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => (previewing ? clearTry(item.slot) : setTryOn((t) => ({ ...t, [item.slot]: item.id })))}
                    aria-label={`ลองใส่${item.name}`}
                    aria-pressed={previewing}
                    className="rounded-2xl transition hover:-translate-y-1 active:scale-95"
                  >
                    <BuddyArt buddy={buddy} outfit={{ [item.slot]: item.id }} className="size-20 sm:size-24" />
                  </button>
                  <p className="mt-1 font-semibold">{item.name}</p>
                  {owned ? (
                    <p className="text-xs font-semibold text-mint-700 dark:text-mint-300">{wearing ? 'ใส่อยู่' : 'มีแล้ว'}</p>
                  ) : (
                    <p className="flex items-center gap-1 text-sm font-bold text-accent-700 dark:text-accent-300">
                      <CoinIcon className="size-4" />
                      {item.price}
                    </p>
                  )}
                  <div className="mt-2 w-full">
                    {owned ? (
                      <button
                        type="button"
                        onClick={() => {
                          equip(item.slot, wearing ? null : item.id)
                          clearTry(item.slot)
                        }}
                        className={`${wearing ? 'btn-ghost' : 'btn-primary'} min-h-10 w-full text-sm`}
                      >
                        {wearing ? 'ถอด' : 'ใส่'}
                      </button>
                    ) : short > 0 ? (
                      <button type="button" disabled className="btn-ghost min-h-10 w-full text-sm">
                        ขาดอีก {short}
                      </button>
                    ) : (
                      <button type="button" onClick={() => onBuy(item)} className="btn-accent min-h-10 w-full text-sm">
                        ซื้อ
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          )}

          {/* วิธีได้เหรียญ */}
          <div className="card deco-card mt-5 p-4 sm:p-5">
            <h2 className="font-semibold">หาเหรียญเพิ่มได้จาก</h2>
            <ul className="mt-2 space-y-1.5 text-[15px]">
              <li className="flex gap-2">
                <CoinIcon className="size-5 shrink-0" />
                <span>
                  เกมในบทเรียน: ตอบถูก +{quizCoins(1)} · ถูกติดกัน 3 ข้อ +{quizCoins(3)} · ติดกัน 5 ข้อ +{quizCoins(5)} ·
                  ถูกหมดรอบ +{PERFECT_BONUS} · เล่นซ้ำได้ ({FULL_ROUNDS_PER_DAY} รอบแรกของวันได้เต็ม หลังจากนั้นได้ครึ่งเดียว)
                </span>
              </li>
              <li className="flex gap-2">
                <CoinIcon className="size-5 shrink-0" />
                <span>
                  สร้าง prompt ใหม่ในภารกิจ +{MISSION_COINS} ({FULL_PROMPTS_PER_DAY} ครั้งแรกของวัน หลังจากนั้น +{MISSION_COINS_TIRED})
                </span>
              </li>
              <li className="flex gap-2">
                <CoinIcon className="size-5 shrink-0" />
                <span>ดูบทเรียนหน้าใหม่ +5 · เรียนจบบทเรียน +20 · ตอบคำถามภารกิจครั้งแรก +10 ต่อหน้า</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/** ตัวละครพิเศษ: ดูท่าจริงก่อนซื้อ ปลดล็อกด้วยเหรียญ แล้วเลือกใช้ได้ทันที */
function SpecialBuddies({ onBought }: { onBought: () => void }) {
  const { game, buy } = useGame()
  const { buddy: current, choose } = useBuddy()
  const notify = useToast()
  const specials = buddies.filter((b) => b.special)

  function unlock(b: BuddyInfo) {
    const item = shopItems.find((i) => i.id === buddyItemId(b.id))
    if (!item || !buy(item)) return
    choose(b.id)
    onBought()
    celebrate('big')
    notify('ปลดล็อกตัวละครพิเศษแล้ว! เปลี่ยนเป็นผู้ช่วยให้เรียบร้อย')
  }

  return (
    <div role="tabpanel" className="mt-4 space-y-3">
      <p className="text-[15px] text-muted">ตัวละครพิเศษมีรัศมีเรืองแสง ประกายดาววนรอบตัว และท่าพิเศษของตัวเอง</p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {specials.map((b, i) => {
          const owned = game.owned.includes(buddyItemId(b.id))
          const using = current.id === b.id
          const short = (b.price ?? 0) - game.coins
          return (
            <li
              key={b.id}
              className={`card deco-card flex animate-fly-in flex-col items-center p-4 text-center ${using ? 'ring-2 ring-brand-500' : ''}`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="rounded-full bg-linear-to-r from-[#ffd23f] to-accent-300 px-3 py-0.5 text-xs font-bold text-[#3b2400]">
                ตัวละครพิเศษ
              </span>
              <LivelyBuddy buddy={b} action="wave" className="mt-2 size-32" label={`แตะเล่นกับ${b.intro}`} />
              <p className="mt-2 font-display text-lg font-bold">{b.trait}</p>
              <p className="text-sm text-muted">{b.intro}</p>
              <div className="mt-3 w-full">
                {owned ? (
                  <button
                    type="button"
                    onClick={() => choose(b.id)}
                    disabled={using}
                    className={`${using ? 'btn-ghost' : 'btn-primary'} min-h-11 w-full`}
                  >
                    {using ? 'ใช้อยู่' : 'ใช้ตัวนี้'}
                  </button>
                ) : short > 0 ? (
                  <button type="button" disabled className="btn-ghost min-h-11 w-full">
                    <CoinIcon className="size-5" />
                    {b.price} · ขาดอีก {short}
                  </button>
                ) : (
                  <button type="button" onClick={() => unlock(b)} className="btn-accent min-h-11 w-full">
                    <CoinIcon className="size-5" />
                    ปลดล็อก {b.price}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
