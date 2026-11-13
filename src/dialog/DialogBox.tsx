import { useEffect, type RefObject } from 'react'
import { motion } from 'motion/react'
import type { Rect } from '../scene/layout'
import { useTypewriter } from './useTypewriter'
import './DialogBox.css'

type Props = {
  box: Rect
  speaker: string
  text: string
  choices?: string[]
  cps: number
  onChoose?: (index: number) => void
  // Сюда окно кладёт функцию «дописать реплику»; true — клик потрачен на это
  skipRef: RefObject<(() => boolean) | null>
}

export function DialogBox({ box, speaker, text, choices, cps, onChoose, skipRef }: Props) {
  const { shown, rest, done, skip } = useTypewriter(text, cps)

  useEffect(() => {
    skipRef.current = () => {
      if (done) return false
      skip()
      return true
    }
  }, [done, skip, skipRef])

  return (
    <motion.div
      className="dialog"
      style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
      // Окно мягко проявляется на месте
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
    >
      {/* Заголовок окна программы; значки справа — только украшение */}
      <div className="dialog__bar">
        <span>Диалог — {speaker}.png</span>
        <span className="dialog__ctrl" aria-hidden="true">
          —&nbsp;&nbsp;□&nbsp;&nbsp;×
        </span>
      </div>

      {/* Для программ чтения с экрана — реплика целиком, без печати по буквам */}
      <p className="sr-only" aria-live="polite">
        {speaker}: {text}
      </p>

      <div className="dialog__body">
        <p className="dialog__text" aria-hidden="true">
          {shown}
          {/* Остаток невидим, но занимает место — строки не прыгают при печати */}
          <span className="dialog__rest">{rest}</span>
        </p>

        {/* Место под ответы занято сразу, чтобы текст не перестраивался, когда они появятся */}
        {choices && (
          <div className="dialog__choices" style={{ visibility: done ? 'visible' : 'hidden' }}>
            {choices.map((c, i) => (
              <motion.button
                key={c}
                className="dialog__choice"
                initial={false}
                animate={done ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                transition={{ duration: 0.25, delay: done ? i * 0.07 : 0 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onChoose?.(i)
                }}
              >
                <span className="dialog__eye" aria-hidden="true">◉</span>
                {c}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {done && !choices && (
        <motion.div
          className="dialog__next"
          aria-hidden="true"
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          Enter ↵
        </motion.div>
      )}
    </motion.div>
  )
}
