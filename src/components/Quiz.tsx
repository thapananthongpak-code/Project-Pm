import { useState } from 'react'
import { lesson, rtcf } from '../data'
import { PARTS, partStyle } from '../lib/rtcf'
import type { RtcfPart } from '../types'
import { useGame } from './Game'
import { Mascot } from './Mascot'

function ScoreBar({ index, total, score, streak }: { index: number; total: number; score: number; streak: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">
        ข้อ {Math.min(index + 1, total)}/{total}
      </span>
      <span className="flex gap-3 font-semibold">
        <span>ถูก {score}</span>
        {streak >= 2 && (
          <span key={streak} className="animate-bounce-in text-accent-700 dark:text-accent-300">
            ติดกัน {streak} ข้อ!
          </span>
        )}
      </span>
    </div>
  )
}

function Finished({ score, total, pass, onRetry }: { score: number; total: number; pass: boolean; onRetry: () => void }) {
  return (
    <div className="flex animate-bounce-in flex-col items-center gap-3 py-4 text-center">
      <Mascot mood={pass ? 'happy' : 'think'} className="size-24" />
      <p className="text-2xl font-bold">
        ได้ {score}/{total} ข้อ
      </p>
      <p className="text-muted">{pass ? 'เก่งมาก! ได้เหรียญด้วยนะ' : 'เกือบแล้ว ลองอีกรอบได้เลย'}</p>
      <button type="button" onClick={onRetry} className="btn-ghost">
        เล่นอีกรอบ
      </button>
    </div>
  )
}

/** เกมแยกประเภท: ประโยคนี้คือ R, T, C หรือ F */
export function QuizSort() {
  const items = lesson.sort
  const { award } = useGame()
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<RtcfPart | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const item = items[i]
  const done = i >= items.length

  function pick(p: RtcfPart) {
    if (picked) return
    setPicked(p)
    if (p === item.answer) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      award({ key: `sort:${i}`, stars: 10 })
    } else {
      setStreak(0)
    }
  }

  function next() {
    const last = i === items.length - 1
    if (last && score >= 8) award({ key: 'sort:badge', badge: 'sorter' })
    setPicked(null)
    setI(i + 1)
  }

  if (done) {
    return (
      <Finished
        score={score}
        total={items.length}
        pass={score >= 8}
        onRetry={() => {
          setI(0)
          setScore(0)
          setStreak(0)
        }}
      />
    )
  }

  const correct = picked === item.answer
  const answerInfo = rtcf.find((r) => r.id === item.answer)!

  return (
    <div className="space-y-4">
      <ScoreBar index={i} total={items.length} score={score} streak={streak} />
      <div key={i} className="flex animate-bounce-in items-center gap-3">
        <Mascot mood={!picked ? 'think' : correct ? 'happy' : 'sad'} className="size-16 shrink-0" />
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
              {correct ? 'ถูกต้อง! ' : 'ยังไม่ใช่ '}
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

/** เกมเลือก prompt ที่ดีกว่า */
export function QuizPick() {
  const items = lesson.pick
  const { award } = useGame()
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const item = items[i]
  const done = i >= items.length

  function pick(n: number) {
    if (picked !== null) return
    setPicked(n)
    if (n === item.better) {
      setScore((s) => s + 1)
      award({ key: `pick:${i}`, stars: 10 })
    }
  }

  function next() {
    if (i === items.length - 1 && score === items.length) award({ key: 'pick:badge', badge: 'sharp-eye' })
    setPicked(null)
    setI(i + 1)
  }

  if (done) {
    return (
      <Finished
        score={score}
        total={items.length}
        pass={score === items.length}
        onRetry={() => {
          setI(0)
          setScore(0)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <ScoreBar index={i} total={items.length} score={score} streak={0} />
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
              <span className="font-semibold">{picked === item.better ? 'ถูกต้อง! ' : 'ยังไม่ใช่ '}</span>
              {item.why}
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
