import { useCallback, useEffect, useRef, useState } from 'react'
import { layout } from '../scene/layout'
import { mainScript } from '../content/dialogues'
import type { Line, Section } from '../content/script'
import { DialogBox } from './DialogBox'
import { isReturning, rememberVisit } from './visit'

// Скорость печати: 35 знаков в секунду (выбрано на этапе 3)
const TYPING_SPEED = 35

const NOT_FOUND = 'Кажется, такой страницы нет. Но раз уж ты здесь — заходи!'

type Position = { scene: string; index: number }

type Props = {
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
export function Dialog({ onEmotion, onSection, paused, fromStart, notFound }: Props) {
  const [pos, setPos] = useState<Position>(() => ({
    scene: !fromStart && isReturning() ? mainScript.returnStart : mainScript.start,
    index: 0,
  }))
  // Отдельная реплика не из сценария; после неё — снова сценарий
  const [interlude, setInterlude] = useState<string | null>(notFound ? NOT_FOUND : null)
  const skipRef = useRef<(() => boolean) | null>(null)

  useEffect(rememberVisit, [])

  const sceneLine = mainScript.scenes[pos.scene][pos.index]
  const line: Line = interlude ? { kind: 'line', text: interlude } : sceneLine

  useEffect(() => {
    if (line.emotion) onEmotion(line.emotion)
  }, [line.emotion, onEmotion])

  const advance = useCallback(() => {
    if (skipRef.current?.()) return
    if (interlude) return setInterlude(null)
    if (line.kind === 'question') return
    // В конце сцены окно остаётся с последней репликой
    setPos((p) => ({ ...p, index: Math.min(p.index + 1, mainScript.scenes[p.scene].length - 1) }))
  }, [interlude, line.kind])

  const choose = (i: number) => {
    if (line.kind !== 'question') return
    const answer = line.answers[i]
    if (answer.next) setPos({ scene: answer.next, index: 0 })
    else if (answer.section) onSection(answer.section)
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
      cps={TYPING_SPEED}
      skipRef={skipRef}
      onChoose={choose}
    />
  )
}
