import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { layout } from '../scene/layout'
import { mainScript } from '../content/dialogues'
import type { Line, Section } from '../content/script'
import { DialogBox } from './DialogBox'
import { nextVariant } from './cycle'
import { isReturning, rememberVisit } from './visit'

// Скорость печати: 35 знаков в секунду (выбрано на этапе 3)
const TYPING_SPEED = 35
// Реплика «перед разделом»: через сколько после допечатки раздел откроется сам
const AUTO_DELAY = 1000

type Position = { scene: string; index: number }

// Отдельная реплика поверх сценария (пасхалка, реакция); потом разговор продолжается с того же места
type Aside = { line: Line; then?: () => void; auto?: boolean }

export type DialogHandle = {
  // Сказать реплику; then — что сделать после неё (например, открыть раздел), auto — сделать это само
  say: (line: Line, options?: { then?: () => void; auto?: boolean }) => void
}

type Props = {
  ref?: Ref<DialogHandle>
  onEmotion: (emotion: string) => void
  onSection: (section: Section) => void
  // Пока открыт раздел, клики и клавиши не листают диалог
  paused: boolean
  // «Начать сначала» — знакомство с первой реплики, даже если гость уже был
  fromStart: boolean
  // Гость пришёл по неизвестному адресу
  notFound: boolean
}

// Ведёт диалог по сценарию: клик, пробел или Enter дописывают реплику, следующий — показывают следующую.
export function Dialog({ ref, onEmotion, onSection, paused, fromStart, notFound }: Props) {
  // Обычное начало: знакомство или «снова ты»
  const [usualStart] = useState(() => (!fromStart && isReturning() ? mainScript.returnStart : mainScript.start))
  // Адрес с опечаткой — сначала сцена «страница не найдена», после неё обычное начало
  const [pos, setPos] = useState<Position>(() => ({
    scene: notFound && mainScript.notFound ? mainScript.notFound : usualStart,
    index: 0,
  }))
  const [aside, setAside] = useState<Aside | null>(null)
  const [typed, setTyped] = useState(false)
  // После отдельной реплики прежняя показывается сразу целиком, без повторной печати
  const [instant, setInstant] = useState(false)
  // Какие сцены уже были за этот визит — для реакции «снова осмотр»
  const shown = useRef(new Set<string>())
  const skipRef = useRef<(() => boolean) | null>(null)

  useEffect(rememberVisit, [])
  useEffect(() => {
    shown.current.add(pos.scene)
  }, [pos.scene])

  const line: Line = aside ? aside.line : mainScript.scenes[pos.scene][pos.index]

  useEffect(() => {
    if (line.emotion) onEmotion(line.emotion)
  }, [line, onEmotion])

  const startAside = (next: Aside) => {
    setTyped(false)
    setInstant(false)
    setAside(next)
  }

  useImperativeHandle(ref, () => ({
    say: (l, options) => startAside({ line: l, ...options }),
  }))

  const finishAside = useCallback(() => {
    if (!aside) return
    setAside(null)
    setInstant(true)
    aside.then?.()
  }, [aside])

  // Реплика «перед разделом» допечатана — через секунду раздел откроется сам
  useEffect(() => {
    if (!aside?.auto || !typed) return
    const t = setTimeout(finishAside, AUTO_DELAY)
    return () => clearTimeout(t)
  }, [aside, typed, finishAside])

  const advance = useCallback(() => {
    if (skipRef.current?.()) return
    if (aside) return finishAside()
    if (line.kind === 'question') return
    setInstant(false)
    setPos((p) => {
      const last = p.index >= mainScript.scenes[p.scene].length - 1
      if (last && p.scene === mainScript.notFound) return { scene: usualStart, index: 0 }
      // В конце сцены окно остаётся с последней репликой
      return last ? p : { ...p, index: p.index + 1 }
    })
  }, [aside, finishAside, line.kind, usualStart])

  const choose = (i: number) => {
    if (line.kind !== 'question') return
    const answer = line.answers[i]
    if (answer.next) {
      // В уже показанную сцену второй раз не ведём — Полина отвечает реакцией «снова осмотр»
      const again = shown.current.has(answer.next) ? nextVariant('реакции:снова осмотр', mainScript.reactions['снова осмотр']) : null
      if (again) startAside({ line: again })
      else {
        setInstant(false)
        setPos({ scene: answer.next, index: 0 })
      }
    } else if (answer.section) onSection(answer.section)
  }

  useEffect(() => {
    if (paused) return
    const onClick = () => advance()
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return
      // На кнопках и ссылках пробел и Enter нажимают их самих
      if ((e.target as HTMLElement).closest('button, a')) return
      e.preventDefault()
      advance()
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [advance, paused])

  return (
    <DialogBox
      box={layout.dialogBox}
      speaker="Полина"
      text={line.text}
      choices={line.kind === 'question' ? line.answers.map((a) => a.text) : undefined}
      cps={instant ? Infinity : TYPING_SPEED}
      skipRef={skipRef}
      onChoose={choose}
      onTyped={() => setTyped(true)}
    />
  )
}
