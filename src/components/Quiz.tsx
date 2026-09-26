import { useState } from 'react'
import { lesson, rtcf } from '../data'
import { dailyCount, FULL_ROUNDS_PER_DAY, perfectBonus, quizCoins } from '../lib/game'
import { PARTS, partStyle } from '../lib/rtcf'
import type { RtcfPart } from '../types'
import { CoinIcon, useGame } from './Game'
import { LivelyBuddy, useBuddy } from './Buddy'

/** สลับลำดับ (ทุกรอบข้อไม่เรียงเหมือนเดิม) */
function shuffled<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function ScoreBar({ index, total, score, streak, earned }: { index: number; total: number; score: number; streak: number; earned: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <span className="text-muted">
        ข้อ {Math.min(index + 1, total)}/{total}
      </span>
      <span className="flex items-center gap-3 font-semibold">
        <span>ถูก {score}</span>
        {streak >= 2 && (
          <span key={streak} className="animate-bounce-in text-accent-700 dark:text-accent-300">
            ติดกัน {streak} ข้อ!
          </span>
        )}
        <span className="flex items-center gap-1 text-accent-700 dark:text-accent-300">
          <CoinIcon className="size-5" />+{earned}
        </span>
      </span>
    </div>
  )
}

/** ข้อความหลังตอบ: บอกเหรียญที่ได้ และโบนัสติดกัน */
function CoinNote({ coins, streak }: { coins: number; streak: number }) {
  return (
    <span className="ml-1 inline-flex animate-bounce-in items-center gap-1 rounded-full bg-[#fff3c4] px-2 py-0.5 text-sm font-bold text-[#7a5200]">
      <CoinIcon className="size-4" />+{coins}
      {streak >= 3 && <span>(ติดกัน {streak} ข้อ!)</span>}
    </span>
  )
}

function Finished({
  score,
  total,
  earned,
  perfect,
  tired,
  badgeText,
  onRetry,
}: {
  score: number
  total: number
  earned: number
  perfect: boolean
  /** รอบนี้เกินจำนวนรอบเต็มต่อวันแล้ว */
  tired: boolean
  badgeText?: string
  onRetry: () => void
}) {
  const { game } = useGame()
  const nextTired = dailyCount(game, 'quizRounds') >= FULL_ROUNDS_PER_DAY
  const { buddy } = useBuddy()
  return (
    <div className="flex animate-bounce-in flex-col items-center gap-3 py-4 text-center">
      <LivelyBuddy action={perfect ? 'love' : score >= total / 2 ? 'cheer' : 'think'} className="size-28" />
      <p className="text-2xl font-bold">
        ได้ {score}/{total} ข้อ
      </p>
      <p className="flex items-center gap-1 text-lg font-bold text-accent-700 dark:text-accent-300">
        <CoinIcon className="size-6" />
        รอบนี้ได้ +{earned} เหรียญ
        {perfect && <span className="text-sm">(รวมโบนัสถูกหมด +{perfectBonus(tired)})</span>}
      </p>
      <p className="text-muted">
        {perfect ? 'ถูกหมดเลย เก่งสุดๆ' : 'เล่นอีกรอบ ได้เหรียญเพิ่มอีกนะ'}
        {badgeText && ` · ${badgeText}`} {buddy.ending}
      </p>
      {nextTired && (
        <p className="max-w-sm rounded-2xl bg-sunken px-3 py-2 text-sm text-muted">
          วันนี้เล่นครบ {FULL_ROUNDS_PER_DAY} รอบแล้ว รอบต่อไปได้เหรียญครึ่งเดียว พรุ่งนี้กลับมาได้เต็มเหมือนเดิม
          ลองไปสร้าง prompt ในภารกิจดูไหม ได้เหรียญเยอะกว่านะ
        </p>
      )}
      <button type="button" onClick={onRetry} className="btn-primary">
        เล่นอีกรอบ
      </button>
    </div>
  )
}

/** ติดตามคะแนน/ติดกัน/เหรียญของ 1 รอบ */
function useRound(total: number) {
  const { game, award } = useGame()
  // ดูตอนเริ่มรอบ: เล่นเกินรอบเต็มของวันนี้แล้วหรือยัง (ไม่เปลี่ยนกลางรอบ)
  const [tired, setTired] = useState(() => dailyCount(game, 'quizRounds') >= FULL_ROUNDS_PER_DAY)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [earned, setEarned] = useState(0)
  const [lastGain, setLastGain] = useState(0)

  function answer(correct: boolean) {
    if (!correct) {
      setStreak(0)
      setLastGain(0)
      return
    }
    const nextStreak = streak + 1
    const coins = quizCoins(nextStreak, tired)
    // ไม่มี key = ได้เหรียญทุกครั้งที่ตอบถูก (เล่นซ้ำได้เหรียญเพิ่ม)
    award({ coins })
    if (nextStreak >= 5) award({ key: 'combo-5', badge: 'combo-5' })
    setScore((s) => s + 1)
    setStreak(nextStreak)
    setEarned((e) => e + coins)
    setLastGain(coins)
  }

  /** จบรอบ: นับรอบ และถูกหมดได้โบนัส */
  function finish(finalScore: number) {
    award({ count: 'quizRounds', daily: 'quizRounds' })
    if (finalScore === total) {
      award({ coins: perfectBonus(tired) })
      setEarned((e) => e + perfectBonus(tired))
    }
  }

  function reset() {
    setTired(dailyCount(game, 'quizRounds') >= FULL_ROUNDS_PER_DAY)
    setScore(0)
    setStreak(0)
    setEarned(0)
    setLastGain(0)
  }

  return { score, streak, earned, lastGain, tired, answer, finish, reset }
}

/** เกมแยกประเภท: ประโยคนี้คือ R, T, C หรือ F */
interface QuizProps {
  /** เล่นจบรอบ (บทเรียนใช้ปลดล็อกสไลด์ถัดไป) */
  onFinish?: () => void
}

export function QuizSort({ onFinish }: QuizProps) {
  const { award } = useGame()
  const { buddy } = useBuddy()
  const [items, setItems] = useState(() => shuffled(lesson.sort))
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<RtcfPart | null>(null)
  const round = useRound(items.length)
  const item = items[i]
  const done = i >= items.length

  function pick(p: RtcfPart) {
    if (picked) return
    setPicked(p)
    round.answer(p === item.answer)
  }

  function next() {
    if (i === items.length - 1) {
      round.finish(round.score)
      onFinish?.()
      if (round.score >= 8) award({ key: 'sort:badge', badge: 'sorter' })
      if (round.score === items.length) award({ key: 'perfect-sort', badge: 'perfect-sort' })
    }
    setPicked(null)
    setI(i + 1)
  }

  if (done) {
    return (
      <Finished
        score={round.score}
        total={items.length}
        earned={round.earned}
        perfect={round.score === items.length}
        tired={round.tired}
        badgeText={round.score >= 8 ? 'ได้ตรารางวัลนักแยก RTCF' : undefined}
        onRetry={() => {
          setItems(shuffled(lesson.sort))
          setI(0)
          round.reset()
        }}
      />
    )
  }

  const correct = picked === item.answer
  const answerInfo = rtcf.find((r) => r.id === item.answer)!

  return (
    <div className="space-y-4">
      <ScoreBar index={i} total={items.length} score={round.score} streak={round.streak} earned={round.earned} />
      <div key={i} className="flex animate-bounce-in items-center gap-3">
        <LivelyBuddy action={!picked ? 'think' : correct ? 'cheer' : 'oops'} className="size-20 shrink-0" />
        <p className="card flex-1 p-4 text-lg font-semibold lg:text-2xl">“{item.text}”</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PARTS.map((p) => {
          const info = rtcf.find((r) => r.id === p)!
          const isAnswer = picked && p === item.answer
          const isWrongPick = picked === p && !correct
          return (
            <button
              key={p}
              type="button"
              onClick={() => pick(p)}
              disabled={!!picked && !isAnswer && !isWrongPick}
              className={`flex min-h-20 flex-col items-center justify-center rounded-2xl border-2 p-2 font-semibold transition duration-200 hover:-translate-y-1 active:scale-95 disabled:opacity-40 ${
                isAnswer
                  ? `${partStyle[p].tile} animate-bounce-in border-transparent ring-4 ${partStyle[p].ring}`
                  : isWrongPick
                    ? 'animate-shake border-accent-400 bg-surface'
                    : `border-line bg-surface ${partStyle[p].text}`
              }`}
            >
              <span className="font-display text-3xl font-bold">{p}</span>
              <span className="text-sm">{info.th}</span>
            </button>
          )
        })}
      </div>
      <div aria-live="polite">
        {picked && (
          <div className="flex animate-fly-in flex-wrap items-center gap-3">
            <p className="flex-1 font-semibold">
              {correct ? `ถูกต้อง! ${buddy.ending}` : 'ยังไม่ใช่ ไม่เป็นไรนะ'}
              {correct && <CoinNote coins={round.lastGain} streak={round.streak} />}{' '}
              <span className={partStyle[item.answer].text}>
                ข้อนี้คือ {item.answer} = {answerInfo.th} ({answerInfo.ask})
              </span>
            </p>
            <button type="button" onClick={next} className="btn-primary">
              {i === items.length - 1 ? 'ดูคะแนน' : 'ข้อต่อไป'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/** สลับลำดับข้อ และสลับฝั่ง ก/ข ของคำตอบ (จำตำแหน่งไม่ได้) */
function shuffledPick() {
  return shuffled(lesson.pick).map((q) =>
    Math.random() < 0.5 ? q : { ...q, options: [q.options[1], q.options[0]] as [string, string], better: (1 - q.better) as 0 | 1 },
  )
}

/** เกมเลือก prompt ที่ดีกว่า */
export function QuizPick({ onFinish }: QuizProps) {
  const { award } = useGame()
  const { buddy } = useBuddy()
  const [items, setItems] = useState(() => shuffledPick())
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const round = useRound(items.length)
  const item = items[i]
  const done = i >= items.length

  function pick(n: number) {
    if (picked !== null) return
    setPicked(n)
    round.answer(n === item.better)
  }

  function next() {
    if (i === items.length - 1) {
      round.finish(round.score)
      onFinish?.()
      if (round.score === items.length) award({ key: 'pick:badge', badge: 'sharp-eye' })
    }
    setPicked(null)
    setI(i + 1)
  }

  if (done) {
    const perfect = round.score === items.length
    return (
      <Finished
        score={round.score}
        total={items.length}
        earned={round.earned}
        perfect={perfect}
        tired={round.tired}
        badgeText={perfect ? 'ได้ตรารางวัลตาไว' : undefined}
        onRetry={() => {
          setItems(shuffledPick())
          setI(0)
          round.reset()
        }}
      />
    )
  }

  const correct = picked === item.better

  return (
    <div className="space-y-4">
      <ScoreBar index={i} total={items.length} score={round.score} streak={round.streak} earned={round.earned} />
      <div key={i} className="grid gap-3 md:grid-cols-2">
        {item.options.map((text, n) => {
          const isBetter = picked !== null && n === item.better
          const wrong = picked === n && n !== item.better
          return (
            <button
              key={n}
              type="button"
              onClick={() => pick(n)}
              style={{ animationDelay: `${n * 120}ms` }}
              className={`card flex min-h-32 animate-fly-in flex-col gap-2 p-4 text-left transition duration-200 hover:-translate-y-1 active:scale-[0.98] ${
                isBetter ? 'ring-4 ring-mint-500' : wrong ? 'animate-shake ring-2 ring-accent-400' : ''
              }`}
            >
              <span className="text-sm font-bold text-muted">แบบ {n === 0 ? 'ก' : 'ข'}</span>
              <span className="text-lg">{text}</span>
              {isBetter && <span className="animate-bounce-in font-bold text-mint-700 dark:text-mint-300">ดีกว่า</span>}
            </button>
          )
        })}
      </div>
      <div aria-live="polite">
        {picked !== null && (
          <div className="flex animate-fly-in flex-wrap items-center gap-3">
            <p className="flex-1">
              <span className="font-semibold">{correct ? `ถูกต้อง! ${buddy.ending}` : 'ยังไม่ใช่ ไม่เป็นไรนะ'}</span>
              {correct && <CoinNote coins={round.lastGain} streak={round.streak} />} {item.why}
            </p>
            <button type="button" onClick={next} className="btn-primary">
              {i === items.length - 1 ? 'ดูคะแนน' : 'ข้อต่อไป'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
