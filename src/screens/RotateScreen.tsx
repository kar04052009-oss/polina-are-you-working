import { motion } from 'motion/react'
import { texts } from '../content/interface'
import './screens.css'

// Экран для вертикального планшета — окно программы в графите
export function RotateScreen() {
  return (
    <main className="screen">
      <div className="screen__window">
        <div className="screen__bar">
          <span>Поворот холста</span>
          <span aria-hidden="true">—&nbsp;□&nbsp;×</span>
        </div>
        <div className="screen__body">
          <motion.svg
            viewBox="0 0 120 160"
            className="screen__tablet"
            aria-hidden="true"
            animate={{ rotate: [0, 0, -90, -90, 0] }}
            transition={{ duration: 3, times: [0, 0.2, 0.5, 0.8, 1], repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="10" y="10" width="100" height="140" rx="10" style={{ fill: 'none', stroke: 'var(--ui-text)', strokeWidth: 5 }} />
            <circle cx="60" cy="136" r="4" style={{ fill: 'var(--ui-text)' }} />
          </motion.svg>
          <h1 className="screen__title">{texts.tablet.title}</h1>
          <p className="screen__text">{texts.tablet.text}</p>
          {texts.tablet.hint && <p className="screen__hint">{texts.tablet.hint}</p>}
        </div>
      </div>
    </main>
  )
}
