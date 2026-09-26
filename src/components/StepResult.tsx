import { useEffect, useState } from 'react'
import { goals, imageTools } from '../data'
import type { Step } from '../hooks/useWizard'
import { buildFreeImagePrompt, buildPrompts, countBlanks, firstBlankPage, toolById } from '../lib/promptBuilder'
import { celebrate } from '../lib/confetti'
import { missionKey } from '../lib/badges'
import { dailyCount, fingerprint, FULL_PROMPTS_PER_DAY, missionCoins } from '../lib/game'
import { PARTS } from '../lib/rtcf'
import type { Answers, GoalId, ToolId } from '../types'
import { CoinIcon, useGame } from './Game'
import { BuddyTip, randomLine } from './Buddy'
import { PromptCard } from './PromptCard'
import { RtcfTag } from './Rtcf'

interface Props {
  goal: GoalId
  answers: Answers
  toolId: ToolId
  onGoTo: (step: Step, page?: number) => void
  onReset: () => void
}

function BlankWarning({ blanks, onFix }: { blanks: number; onFix: () => void }) {
  if (blanks === 0) return null
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-3 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-2 text-[#5a2a05] dark:border-accent-700/60 dark:bg-accent-700/15 dark:text-accent-100">
      <span className="flex-1">ยังมีช่องว่าง [__] {blanks} จุด</span>
      <button type="button" onClick={onFix} className="min-h-10 rounded-xl font-semibold underline underline-offset-4">
        กลับไปเติม
      </button>
    </p>
  )
}

export function StepResult({ goal, answers, toolId, onGoTo, onReset }: Props) {
  const tool = toolById(toolId)
  const goalInfo = goals.find((g) => g.id === goal)
  const { game, award } = useGame()
  const [cheer] = useState(() => randomLine('done'))
  // prompt ใหม่ที่ไม่ซ้ำเดิมได้เหรียญทุกครั้ง (ไม่ขึ้นกับ AI ที่เลือก กันการสลับ AI เพื่อเก็บเหรียญ)
  const doneKey = `done:${goal}:${fingerprint(goal === 'image' ? buildFreeImagePrompt(answers, null) : buildPrompts(goal, answers, null).content)}`
  const [fresh] = useState(() => !game.claimed.includes(doneKey))
  // prompt ใหม่วันนี้เกิน 5 ครั้งแล้ว ได้เหรียญน้อยลง (กันเปลี่ยนตัวเลือกนิดเดียวแล้วเก็บเหรียญซ้ำๆ)
  const [coins] = useState(() => missionCoins(dailyCount(game, 'prompts')))

  // ภารกิจสำเร็จ: พลุกระดาษ + เหรียญ (prompt ใหม่) + ตรารางวัล (ครั้งแรก)
  useEffect(() => {
    celebrate('big')
    award({ key: doneKey, coins, count: 'prompts', daily: 'prompts' })
    award({ key: missionKey(goal) })
  }, [doneKey, coins, goal, award])

  // หน้าสรุปมี prompt กล่องเดียว: คัดลอกแล้วเปิด AI ได้ทันที
  const prompt = goal === 'image' ? buildFreeImagePrompt(answers, toolId) : buildPrompts(goal, answers, toolId).content
  const note = goal === 'image' ? imageTools.find((t) => t.id === toolId)?.note : undefined

  return (
    <section aria-labelledby="step-heading" className="animate-step-in">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="step-heading" tabIndex={-1} className="animate-bounce-in text-2xl font-bold lg:text-3xl">
          ภารกิจสำเร็จ!
        </h2>
        <div className="flex gap-1.5">
          {PARTS.map((p, i) => (
            <span key={p} className="animate-bounce-in" style={{ animationDelay: `${300 + i * 150}ms` }}>
              <RtcfTag part={p} size="md" />
            </span>
          ))}
        </div>
      </div>
      <BuddyTip action="cheer" lead={cheer} className="mt-3">
        prompt ของเธอมีครบทั้ง 4 ส่วน นำไปใช้ใน {tool.name} ได้เลย
        <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
          <CoinIcon className="size-5" />
          {!fresh
            ? 'prompt นี้ได้เหรียญไปแล้ว ลองสร้าง prompt แบบใหม่เพื่อรับเหรียญเพิ่ม'
            : coins === missionCoins(0)
              ? `ได้ +${coins} เหรียญ จาก prompt ใหม่นี้`
              : `ได้ +${coins} เหรียญ (วันนี้สร้าง prompt ใหม่ครบ ${FULL_PROMPTS_PER_DAY} ครั้งแล้ว พรุ่งนี้ได้เต็มอีกนะ)`}
        </span>
      </BuddyTip>

      <div className="mx-auto max-w-3xl">
        <BlankWarning
          blanks={countBlanks(prompt)}
          onFix={() => onGoTo(1, goal === 'image' ? 0 : Math.max(firstBlankPage(goal, answers), 0))}
        />
        <div className="mt-5">
          <PromptCard
            title={goal === 'image' ? 'สร้างภาพ' : 'เขียนเนื้อหา'}
            subtitle={`เปิดแชทใหม่ใน ${tool.name} แล้ววาง`}
            text={prompt}
            openTool={tool}
          >
            {note && <p className="mt-3 rounded-2xl bg-sunken px-3 py-2 text-[15px] text-muted">{note}</p>}
          </PromptCard>
        </div>
      </div>

      <p className="mt-6 text-center text-[15px] text-muted">
        {goal === 'image' ? 'ภาพจาก AI อาจไม่ตรงใจในครั้งแรก ลองพิมพ์บอกต่อในแชทได้เลย' : 'AI อาจแต่งเรื่องเพิ่มเอง อ่านทวนก่อนใช้ทุกครั้ง'}
        {goalInfo?.note && <> · {goalInfo.note}</>}
      </p>

      <div className="mx-auto mt-4 flex max-w-xl gap-2">
        <button type="button" onClick={() => onGoTo(1, 0)} className="btn-ghost flex-1">
          แก้คำตอบ
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('ล้างคำตอบทั้งหมดแล้วเริ่มใหม่?')) onReset()
          }}
          className="btn-ghost flex-1"
        >
          เริ่มใหม่
        </button>
      </div>
    </section>
  )
}
