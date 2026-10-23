import { motion } from 'motion/react'
import './screens.css'

export function RotateScreen() {
  return (
    <main className="screen">
      <div className="screen__card">
        <motion.svg
          viewBox="0 0 120 160"
          className="screen__tablet"
          aria-hidden="true"
          animate={{ rotate: [0, 0, -90, -90, 0] }}
          transition={{ duration: 3, times: [0, 0.2, 0.5, 0.8, 1], repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="10" y="10" width="100" height="140" rx="14" style={{ fill: 'var(--color-white)', stroke: 'var(--color-crimson)', strokeWidth: 6 }} />
          <circle cx="60" cy="136" r="5" style={{ fill: 'var(--color-crimson)' }} />
        </motion.svg>
        <h1 className="screen__title">Поверни планшет</h1>
        <p className="screen__text">Так комната поместится целиком.</p>
      </div>
    </main>
  )
}
