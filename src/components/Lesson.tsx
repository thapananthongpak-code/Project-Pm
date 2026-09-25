import { useCallback, useEffect, useRef, useState } from 'react'
import { lesson, rtcf, type SlideKind } from '../data'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { PARTS, partHeading, partStyle } from '../lib/rtcf'
import type { RtcfPart } from '../types'
import { BadgeShelf } from './BadgeShelf'
import { useGame } from './Game'
import type { Menu } from './Header'
import { Buddy, BuddyTip, LivelyBuddy, useBuddy } from './Buddy'
import { QuizPick, QuizSort } from './Quiz'
import { RtcfTag, RtcfText } from './Rtcf'
import { SCHOOL } from './layout'

const slides = lesson.slides
const goodPrompt = lesson.assemble.map((a) => `${partHeading[a.part]}: ${a.text}`).join('\n')

const slideTitles: Record<SlideKind, string> = {
  cover: 'เริ่มต้น',
  compare: 'Prompt คืออะไร',
  part: '',
  assemble: 'รวมร่าง',
  tips: 'เคล็ดลับ',
  'quiz-sort': 'เกมแยก RTCF',
  'quiz-pick': 'เกมเลือกให้ดีกว่า',
  end: 'สรุป',
}

interface Props {
  onGo: (menu: Menu) => void
}

/** บทเรียน RTCF แบบสไลด์ ใช้ได้ทั้งนักเรียนเรียนเอง และครูฉายหน้าห้อง (โหมดนำเสนอ) */
export function Lesson({ onGo }: Props) {
  const [index, setIndex] = useLocalStorage<number>('promptfolio:lesson:v1', 0, (raw) =>
    typeof raw === 'number' && raw >= 0 && raw < slides.length ? raw : 0,
  )
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  const [present, setPresent] = useState(false)
  // โหมดนำเสนอ: ขยายสไลด์ตามขนาดจอ ให้คนหลังห้องอ่านได้
  const [zoom, setZoom] = useState(1)
  useEffect(() => {
    if (!present) return setZoom(1)
    const fit = () => setZoom(Math.min(1.9, Math.max(1, window.innerWidth / 900)))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [present])
  const stageRef = useRef<HTMLDivElement>(null)
  const { award, reset } = useGame()
  const slide = slides[index]

  // ดูสไลด์ใหม่ได้ 5 เหรียญ ดูครบได้ตรารางวัล
  useEffect(() => {
    award({ key: `slide:${slide.id}`, coins: 5 })
    if (index === slides.length - 1) award({ key: 'lesson:done', coins: 20, badge: 'learner' })
  }, [slide.id, index, award])

  const go = useCallback(
    (to: number) => {
      const next = Math.max(0, Math.min(slides.length - 1, to))
      if (next === index) return
      setDir(next > index ? 'next' : 'prev')
      setIndex(next)
      if (!present) window.scrollTo({ top: 0 })
    },
    [index, present, setIndex],
  )

  // ลูกศรซ้าย/ขวาเปลี่ยนสไลด์ (ไม่ทำงานตอนพิมพ์), Esc ออกจากโหมดนำเสนอ
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea')) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') go(index + 1)
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(index - 1)
      if (e.key === 'Escape') setPresent(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index])

  // โหมดนำเสนอ: ขอเต็มจอจริงถ้าเบราว์เซอร์รองรับ (iPhone ไม่รองรับ จะใช้แบบเต็มหน้าเว็บแทน)
  useEffect(() => {
    if (!present) {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
      return
    }
    void stageRef.current?.requestFullscreen?.().catch(() => {})
    const onChange = () => {
      if (!document.fullscreenElement) setPresent(false)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [present])

  const isLast = index === slides.length - 1
  const title = slide.kind === 'part' ? `${slide.part} = ${rtcf.find((r) => r.id === slide.part)?.en}` : slideTitles[slide.kind]

  return (
    <section aria-labelledby="page-heading" className="animate-step-in">
      <div
        ref={stageRef}
        className={
          present
            ? 'fixed inset-0 z-40 flex flex-col overflow-auto bg-bg p-4 text-lg sm:p-8 lg:text-2xl'
            : 'flex flex-col'
        }
      >
        <div className="flex items-center justify-between gap-2">
          <h1 id="page-heading" className="text-sm font-semibold text-muted">
            บทเรียน RTCF · <span className="text-ink">{title}</span>
          </h1>
          <button type="button" onClick={() => setPresent((p) => !p)} className="btn-ghost min-h-10 px-3 text-sm">
            {present ? 'ออกจากโหมดนำเสนอ' : 'โหมดนำเสนอ'}
          </button>
        </div>

        {/* จุดบอกสไลด์ */}
        <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="สไลด์">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`สไลด์ ${i + 1}`}
              onClick={() => go(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-8 bg-brand-600' : i < index ? 'w-2.5 bg-brand-300' : 'w-2.5 bg-line'
              }`}
            />
          ))}
        </div>

        <div
          key={slide.id}
          role="tabpanel"
          className={`card deco-card mt-4 flex-1 p-5 sm:p-8 lg:p-10 ${present ? '' : 'min-h-[60vh]'} ${
            dir === 'next' ? 'animate-slide-next' : 'animate-slide-prev'
          }`}
        >
          <div className="mx-auto max-w-5xl" style={present ? { zoom } : undefined}>
            <SlideBody kind={slide.kind} part={slide.part} onGo={onGo} onReset={reset} />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className="btn-ghost">
            ย้อนกลับ
          </button>
          {isLast ? (
            <button type="button" onClick={() => onGo('create')} className="btn-primary flex-1 text-lg">
              เริ่มภารกิจ
            </button>
          ) : (
            <button type="button" onClick={() => go(index + 1)} className="btn-primary flex-1 text-lg">
              ถัดไป
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

function SlideBody({
  kind,
  part,
  onGo,
  onReset,
}: {
  kind: SlideKind
  part?: RtcfPart
  onGo: (menu: Menu) => void
  onReset: () => void
}) {
  const { buddy } = useBuddy()
  switch (kind) {
    case 'cover':
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <LivelyBuddy action="wave" className="size-36 lg:size-48" label="แตะเล่นกับผู้ช่วย" />
          <p className="text-sm font-semibold text-muted">{SCHOOL}</p>
          <h2 className="text-3xl font-bold leading-tight sm:text-5xl">
            เขียน Prompt ให้เก่ง
            <br />
            <span className="bg-linear-to-r from-brand-600 via-sea-600 to-mint-600 bg-clip-text text-transparent dark:from-brand-300 dark:via-sea-300 dark:to-mint-300">
              ด้วยหลัก RTCF
            </span>
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {PARTS.map((p, i) => (
              <span key={p} className="animate-bounce-in" style={{ animationDelay: `${300 + i * 180}ms` }}>
                <RtcfTag part={p} withName />
              </span>
            ))}
          </div>
          <p className="text-muted">
            สวัสดี! วันนี้เราจะไปรู้จัก 4 ส่วนของ prompt ที่ดีกัน {buddy.ending}
          </p>
        </div>
      )

    case 'compare':
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold sm:text-4xl">Prompt คืออะไร?</h2>
          <p className="text-lg text-muted">
            Prompt คือข้อความที่เราพิมพ์สั่งหรือถาม AI <strong className="text-ink">ยิ่งบอกชัด AI ยิ่งตอบตรงใจ</strong>
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="animate-fly-in rounded-3xl border-2 border-dashed border-accent-300 p-4">
              <div className="flex items-center gap-3">
                <Buddy action="oops" className="size-16 shrink-0" />
                <p className="font-bold text-accent-700 dark:text-accent-300">prompt ที่ยังไม่ดี</p>
              </div>
              <p className="mt-3 rounded-2xl bg-sunken p-4 text-xl">“{lesson.compare.bad}”</p>
              <p className="mt-2 text-muted">{lesson.compare.badNote}</p>
            </div>
            <div className="animate-fly-in rounded-3xl border-2 border-mint-400 p-4" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-3">
                <Buddy action="cheer" className="size-16 shrink-0" />
                <p className="font-bold text-mint-700 dark:text-mint-300">prompt ที่ดี</p>
              </div>
              <div className="mt-3">
                <RtcfText text={goodPrompt} animate />
              </div>
              <p className="mt-2 text-muted">{lesson.compare.goodNote}</p>
            </div>
          </div>
        </div>
      )

    case 'part': {
      const info = rtcf.find((r) => r.id === part)!
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <span className="animate-bounce-in">
              <RtcfTag part={info.id} size="lg" />
            </span>
            <div>
              <h2 className={`font-display text-3xl font-bold sm:text-5xl ${partStyle[info.id].text}`}>{info.en}</h2>
              <p className="text-xl text-muted">{info.th}</p>
            </div>
          </div>
          <p className="animate-fly-in text-2xl font-bold sm:text-3xl" style={{ animationDelay: '150ms' }}>
            {info.ask}
          </p>
          <p className="animate-fly-in text-lg" style={{ animationDelay: '250ms' }}>
            {info.desc}
          </p>
          <p className="animate-fly-in" style={{ animationDelay: '350ms' }}>
            <span className="text-muted">มักขึ้นต้นด้วย </span>
            <span className={`rounded-xl px-3 py-1 font-semibold ${partStyle[info.id].soft} ${partStyle[info.id].text}`}>
              {info.starter}
            </span>
          </p>
          <div className="space-y-2">
            <p className="font-semibold">ตัวอย่าง</p>
            {info.examples.map((ex, i) => (
              <p
                key={ex}
                className={`animate-fly-in rounded-2xl border-l-4 p-3 text-lg ${partStyle[info.id].soft} ${partStyle[info.id].border}`}
                style={{ animationDelay: `${450 + i * 150}ms` }}
              >
                {ex}
              </p>
            ))}
          </div>
          <BuddyTip action="love" lead="จำง่ายๆ">
            {info.tip}
          </BuddyTip>
        </div>
      )
    }

    case 'assemble':
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold sm:text-4xl">
            รวมร่าง{' '}
            {PARTS.map((p, i) => (
              <span key={p} className={partStyle[p].text}>
                {p}
                {i < PARTS.length - 1 && <span className="text-muted"> + </span>}
              </span>
            ))}
          </h2>
          <p className="text-muted">นำ 4 ส่วนมาต่อกัน ได้ prompt ที่ AI เข้าใจทันที</p>
          <div className="text-lg">
            <RtcfText text={goodPrompt} animate />
          </div>
          <BuddyTip action="cheer" lead="รวมร่างสำเร็จ!">
            ลำดับสลับกันได้ ขอแค่มีครบทั้ง 4 ส่วน
          </BuddyTip>
        </div>
      )

    case 'tips':
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold sm:text-4xl">เคล็ดลับใช้ AI ให้เก่งและปลอดภัย</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {lesson.tips.map((tip, i) => (
              <li
                key={tip.title}
                className="flex animate-fly-in gap-3 rounded-2xl bg-sunken p-4"
                style={{ animationDelay: `${i * 130}ms` }}
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl font-bold ${partStyle[PARTS[i % 4]].tile}`}>
                  {i + 1}
                </span>
                <span>
                  <span className="block font-bold">{tip.title}</span>
                  <span className="text-muted">{tip.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )

    case 'quiz-sort':
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold sm:text-4xl">เกม: ประโยคนี้คือส่วนไหน?</h2>
          <p className="text-muted">อ่านประโยค แล้วกด R, T, C หรือ F ตอบถูกได้ 10 เหรียญ</p>
          <QuizSort />
        </div>
      )

    case 'quiz-pick':
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold sm:text-4xl">เกม: แบบไหนดีกว่า?</h2>
          <p className="text-muted">เลือก prompt ที่ AI จะตอบได้ตรงใจกว่า ตอบถูกได้ 10 เหรียญ</p>
          <QuizPick />
        </div>
      )

    case 'end':
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <LivelyBuddy action="love" className="size-28 shrink-0" label="แตะเล่นกับผู้ช่วย" />
            <div>
              <h2 className="text-2xl font-bold sm:text-4xl">เก่งมาก! พร้อมลุยแล้ว</h2>
              <p className="text-muted">จำไว้: R ใคร · T ทำอะไร · C ข้อมูลเบื้องหลัง · F หน้าตาคำตอบ</p>
            </div>
          </div>
          <BadgeShelf />
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => onGo('create')} className="btn-primary">
              ภารกิจทำสไลด์
            </button>
            <button type="button" onClick={() => onGo('image')} className="btn-ghost">
              ภารกิจสร้างภาพ
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('ล้างเหรียญและตรารางวัลทั้งหมด (สำหรับให้คนถัดไปใช้เครื่องนี้)?')) onReset()
            }}
            className="min-h-10 w-full rounded-xl text-sm text-muted underline underline-offset-4 hover:text-ink"
          >
            ล้างเหรียญและตรารางวัล (ใช้เครื่องร่วมกัน)
          </button>
        </div>
      )
  }
}
