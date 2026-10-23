import { motion } from 'motion/react'
import { contacts } from '../content/contacts'
import { polinaSprite } from '../scene/assets'
import './screens.css'

export function PhoneStub() {
  const portrait = polinaSprite('phone')

  return (
    <main className="screen">
      <motion.div
        className="screen__card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {portrait ? (
          <img src={portrait} alt="Полина" className="screen__portrait" />
        ) : (
          <svg viewBox="0 0 200 220" className="screen__portrait" aria-hidden="true">
            <circle cx="100" cy="70" r="50" style={{ fill: 'var(--color-pink)', stroke: 'var(--color-crimson)', strokeWidth: 4 }} />
            <rect x="40" y="130" width="120" height="90" rx="50" style={{ fill: 'var(--color-pink)', stroke: 'var(--color-crimson)', strokeWidth: 4 }} />
          </svg>
        )}
        <h1 className="screen__title">Загляни ко мне с компьютера</h1>
        <p className="screen__text">Мой сайт — маленькая комната, и на большом экране в ней гораздо уютнее.</p>
        {contacts.length > 0 && (
          <ul className="screen__links">
            {contacts.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noreferrer">
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </main>
  )
}
