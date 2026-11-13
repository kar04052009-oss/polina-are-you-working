import { useEffect } from 'react'
import { motion } from 'motion/react'
import { texts } from '../content/interface'
import './SectionWindow.css'

type Props = { rect: { left: number; top: number; width: number; height: number }; onClose: () => void }

// Портфолио внутри экрана монитора (камера уже приблизилась). Пока заглушка — рабочий стол с папками будет на этапе 7.
export function MonitorDesk({ rect, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.section
      className="monitor-desk"
      role="dialog"
      aria-labelledby="desk-title"
      style={rect}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="monitor-desk__bar">
        <span>Портфолио</span>
        <button className="monitor-desk__close" onClick={onClose} aria-label="Закрыть" autoFocus>
          ×
        </button>
      </div>
      <div className="monitor-desk__body">
        <div className="monitor-desk__crumbs">Полина › Портфолио</div>
        <h1 id="desk-title" className="monitor-desk__title">
          Портфолио
        </h1>
        <p className="monitor-desk__text">{texts.soon('портфолио')}</p>
      </div>
    </motion.section>
  )
}
