import { motion } from 'motion/react'
import { mainScript } from './content/dialogues'
import './App.css'

export function App() {
  const line = mainScript.greeting[0]

  return (
    <main className="stub">
      <motion.h1
        className="stub__title"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Полина, ты работаешь?
      </motion.h1>

      <motion.div
        className="dialog"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <span className="dialog__name">{line.speaker}</span>
        <p className="dialog__text">{line.text}</p>
      </motion.div>
    </main>
  )
}
