import { useEffect, useRef, useState, type ReactNode } from 'react'
import { layout } from '../scene/layout'
import { roomImage, polinaSprite } from '../scene/assets'

const m = layout.main
const room = layout.room
const p = layout.polina
const d = layout.dialogBox
const fadeBottom = 'linear-gradient(to bottom, black 80%, transparent 97%)'

// Кадр 16:9 с основной зоной комнаты; всё внутри — в пикселях холста, как на сайте
function Frame({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)
  useEffect(() => {
    const el = ref.current!
    const ro = new ResizeObserver(() => setScale(el.clientWidth / m.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const sprite = polinaSprite('neutral')
  return (
    <section className="mk-card">
      <h2>{title}</h2>
      <p className="mk-note">{note}</p>
      <div className="mk-frame" ref={ref} style={{ background: room.edgeColor }}>
        <div
          className="mk-stage"
          style={{
            width: layout.canvas.width,
            height: layout.canvas.height,
            transform: `translate(${-m.x * scale}px, ${-m.y * scale}px) scale(${scale})`,
          }}
        >
          {roomImage && <img src={roomImage} alt="" style={{ position: 'absolute', left: room.x, top: room.y, width: room.width, height: room.height }} />}
          {sprite && (
            <img
              src={sprite}
              alt=""
              style={{ position: 'absolute', left: p.x, top: p.y, width: p.width, height: p.height, maskImage: fadeBottom, WebkitMaskImage: fadeBottom }}
            />
          )}
          {children}
        </div>
      </div>
    </section>
  )
}

const TEXT = 'Привет! Заходи, у меня тут немного творческий беспорядок. Хочешь посмотреть, над чем я сейчас работаю?'
const ANSWERS = ['Покажи работы', 'Расскажи о себе', 'Сначала осмотрюсь']

// Кнопка «Меню» в углу (на сайте — в обычных пикселях экрана; здесь примерно того же размера)
function MenuButton({ open = false }: { open?: boolean }) {
  return (
    <div className="mk-menu" style={{ right: layout.canvas.width - (m.x + m.width) + 28, top: m.y + 28 }}>
      <div className={`mk-menu__toggle ${open ? 'is-open' : ''}`}>Меню ▾</div>
      {open && (
        <div className="mk-menu__list">
          {[
            ['Портфолио', 'Ctrl+1'],
            ['Обо мне', 'Ctrl+2'],
            ['Контакты', 'Ctrl+3'],
          ].map(([t, k], i) => (
            <div key={t} className={`mk-menu__item ${i === 0 ? 'is-hover' : ''}`}>
              <span>{t}</span>
              <span className="mk-menu__key">{k}</span>
            </div>
          ))}
          <div className="mk-menu__sep" />
          <div className="mk-menu__item">
            <span>Начать сначала</span>
            <span className="mk-menu__key">Ctrl+Z</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Маркеры рамки выделения по углам и серединам сторон
function Handles({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const pts = [
    [x, y], [x + w / 2, y], [x + w, y],
    [x, y + h / 2], [x + w, y + h / 2],
    [x, y + h], [x + w / 2, y + h], [x + w, y + h],
  ]
  return (
    <>
      {pts.map(([hx, hy], i) => (
        <span key={i} className="mk-handle" style={{ left: hx - 9, top: hy - 9 }} />
      ))}
    </>
  )
}

export function Maket() {
  return (
    <main className="mk">
      <header className="mk-head">
        <h1>Макет интерфейса · направление C «Рабочая программа» · графит</h1>
        <p>
          Три варианта окна реплики и вид меню и раздела. Комната и Полина настоящие. Шрифты: JetBrains Mono (имя, кнопки,
          служебные подписи) и Golos Text (текст реплики). Это только макет — на сайте ничего не изменилось.
        </p>
      </header>

      <Frame
        title="1. Выделенный слой"
        note="Окно как выбранный слой в программе: тонкая рамка с маркерами, вкладка «Полина.png», внизу подсказка «Enter ↵». Самый близкий к наброску."
      >
        <div className="mk-panel" style={{ left: d.x, top: d.y, width: d.width, height: d.height }}>
          <p className="mk-text">{TEXT}</p>
          <div className="mk-answers">
            {ANSWERS.map((a, i) => (
              <span key={a} className={`mk-btn ${i === 0 ? 'is-hover' : ''}`}>
                ▸ {a}
              </span>
            ))}
          </div>
        </div>
        <Handles x={d.x} y={d.y} w={d.width} h={d.height} />
        <div className="mk-tab" style={{ left: d.x, top: d.y - 52 }}>
          Полина.png
        </div>
        <div className="mk-size" style={{ left: d.x + d.width / 2, top: d.y + d.height + 18 }}>
          2400 × 290
        </div>
        <MenuButton />
      </Frame>

      <Frame
        title="2. Окно-панель"
        note="Реплика в отдельной панели программы с заголовком и кнопками «свернуть» и «закрыть» (декоративными). Ответы — строки списка, как слои в панели слоёв."
      >
        <div className="mk-window" style={{ left: d.x, top: d.y - 40, width: d.width, height: d.height + 40 }}>
          <div className="mk-window__bar">
            <span>Диалог — Полина.png</span>
            <span className="mk-window__ctrl">—&nbsp;&nbsp;□&nbsp;&nbsp;×</span>
          </div>
          <div className="mk-window__body">
            <p className="mk-text" style={{ flex: 1 }}>
              {TEXT}
            </p>
            <div className="mk-rows">
              {ANSWERS.map((a, i) => (
                <div key={a} className={`mk-row ${i === 0 ? 'is-hover' : ''}`}>
                  <span className="mk-row__eye">◉</span>
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
        <MenuButton />
      </Frame>

      <Frame
        title="3. Комментарий"
        note="Реплика как комментарий в программе для совместной работы: кружок-аватар, имя и время. Окно стоит ближе к Полине, ответы — как кнопки «ответить»."
      >
        <div className="mk-comment" style={{ left: 820, top: 1150, width: 1080 }}>
          <div className="mk-comment__head">
            <span className="mk-avatar">П</span>
            <span className="mk-comment__name">Полина</span>
            <span className="mk-comment__time">сейчас</span>
          </div>
          <p className="mk-text" style={{ fontSize: 42 }}>
            {TEXT}
          </p>
          <div className="mk-answers" style={{ flexWrap: 'wrap' }}>
            {ANSWERS.map((a, i) => (
              <span key={a} className={`mk-chip ${i === 0 ? 'is-hover' : ''}`}>
                {a}
              </span>
            ))}
          </div>
        </div>
        <MenuButton />
      </Frame>

      <Frame
        title="Меню и окно раздела"
        note="Меню (вариант B) в виде выпадающего меню программы с «горячими клавишами». Раздел открывается окном приложения с заголовком и кнопкой ×. Внутри — заглушка, сами разделы будут на этапах 7–10."
      >
        <div className="mk-dim" style={{ width: layout.canvas.width, height: layout.canvas.height }} />
        <div className="mk-window" style={{ left: m.x + 420, top: m.y + 170, width: m.width - 840, height: 880 }}>
          <div className="mk-window__bar">
            <span>Портфолио</span>
            <span className="mk-window__ctrl">×</span>
          </div>
          <div className="mk-window__body" style={{ padding: '70px 80px' }}>
            <div className="mk-crumbs">Полина › Портфолио</div>
            <h3 className="mk-h">Портфолио</h3>
            <p className="mk-text">Скоро здесь будет рабочий стол с папками моих проектов.</p>
          </div>
        </div>
        <MenuButton open />
      </Frame>
    </main>
  )
}
