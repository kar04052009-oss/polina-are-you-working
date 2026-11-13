import { motion } from 'motion/react'
import { contacts } from '../content/contacts'
import { polinaSprite } from '../scene/assets'
import { texts } from '../content/interface'
import './screens.css'

// Заглушка для телефонов — окно программы в графите
export function PhoneStub() {
  // Отдельный портрет phone.png, если появится; пока — верх обычного спрайта
  const portrait = polinaSprite('phone') ?? polinaSprite('neutral')

  return (
    <main className="screen">
      <motion.div
        className="screen__window"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="screen__bar">
          <span>Полина.png</span>
          <span aria-hidden="true">—&nbsp;□&nbsp;×</span>
        </div>
        <div className="screen__body">
          {portrait ? (
            <img src={portrait} alt="Полина" className="screen__portrait" />
          ) : (
            <svg viewBox="0 0 200 220" className="screen__portrait" aria-hidden="true">
              <circle cx="100" cy="70" r="50" style={{ fill: 'var(--ui-bar)', stroke: 'var(--ui-line)', strokeWidth: 4 }} />
              <rect x="40" y="130" width="120" height="90" rx="50" style={{ fill: 'var(--ui-bar)', stroke: 'var(--ui-line)', strokeWidth: 4 }} />
            </svg>
          )}
          <h1 className="screen__title">{texts.phone.title}</h1>
          <p className="screen__text">{texts.phone.text}</p>
          {contacts.length > 0 && (
            <ul className="screen__links">
              {contacts.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noreferrer">
                    ◉ {link.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </main>
  )
}
