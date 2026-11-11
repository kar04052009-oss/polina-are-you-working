import { useEffect, useRef, useState, type ReactNode } from 'react'
import { layout } from '../scene/layout'
import { roomImage } from '../scene/assets'
import { Polina } from '../scene/Polina'

const m = layout.main
const room = layout.room
const d = layout.dialogBox


// Цвет комнаты под курсором — для пипетки. Картинка уменьшается в 4 раза, этого хватает.
function useRoomPixels() {
  const ref = useRef<{ data: Uint8ClampedArray; w: number; h: number } | null>(null)
  useEffect(() => {
    if (!roomImage) return
    const img = new Image()
    img.onload = () => {
      const w = Math.round(room.width / 4)
      const h = Math.round(room.height / 4)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      ref.current = { data: ctx.getImageData(0, 0, w, h).data, w, h }
    }
    img.src = roomImage
  }, [])
  return (cx: number, cy: number) => {
    const px = ref.current
    if (!px) return '#000000'
    const x = Math.min(px.w - 1, Math.max(0, Math.floor(((cx - room.x) / room.width) * px.w)))
    const y = Math.min(px.h - 1, Math.max(0, Math.floor(((cy - room.y) / room.height) * px.h)))
    const i = (y * px.w + x) * 4
    return '#' + [px.data[i], px.data[i + 1], px.data[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()
  }
}

// Предмет под курсором. Полина проверяется последней: предметы перед ней важнее.
function inPolygon(x: number, y: number, pts: [number, number][]) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function itemAt(cx: number, cy: number) {
  const items = [...layout.items].sort((a, b) => (a.id === 'polina' ? 1 : 0) - (b.id === 'polina' ? 1 : 0))
  return items.find((i) =>
    i.points ? inPolygon(cx, cy, i.points) : cx >= i.x && cx <= i.x + i.width && cy >= i.y && cy <= i.y + i.height,
  )
}

// Курсор-пипетка: кружок с цветом комнаты под курсором и его код; над предметами — подпись
function Cursor({ x, y, cx, cy, sample }: { x: number; y: number; cx: number; cy: number; sample: (cx: number, cy: number) => string }) {
  const color = sample(cx, cy)
  const item = itemAt(cx, cy)
  return (
    <div className="mk-cursor" style={{ left: x, top: y }}>
      <svg width="24" height="24" viewBox="0 0 24 24" style={{ transform: 'translate(-2px, -22px)' }}>
        <path
          d="M3 21l1.5-4.5L14 7l3 3-9.5 9.5z M14 7l2-2a2.1 2.1 0 0 1 3 3l-2 2"
          fill="#1e1e1e"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="mk-cursor__swatch">
        <span className="mk-cursor__dot" style={{ background: color }} />
        {item && (
          <b className="mk-cursor__name">
            {item.label}
            {item.kind === 'section' && <em> · {item.goal}</em>}
          </b>
        )}
        {color}
      </span>
    </div>
  )
}

// Кадр 16:9 с основной зоной комнаты; всё внутри — в пикселях холста, как на сайте
function Frame({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const sample = useRoomPixels()

  useEffect(() => {
    const el = ref.current!
    const ro = new ResizeObserver(() => setScale(el.clientWidth / m.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <section className="mk-card">
      <h2>{title}</h2>
      <p className="mk-note">{note}</p>
      <div
        className="mk-frame"
        ref={ref}
        style={{ background: room.edgeColor }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
        }}
        onMouseLeave={() => setPos(null)}
      >
        <div
          className="mk-stage"
          style={{
            width: layout.canvas.width,
            height: layout.canvas.height,
            transform: `translate(${-m.x * scale}px, ${-m.y * scale}px) scale(${scale})`,
          }}
        >
          {roomImage && <img src={roomImage} alt="" style={{ position: 'absolute', left: room.x, top: room.y, width: room.width, height: room.height }} />}
          <Polina emotion="neutral" />
          {children}
        </div>
        {pos && (
          <Cursor
            x={pos.x}
            y={pos.y}
            cx={Math.round(m.x + pos.x / scale)}
            cy={Math.round(m.y + pos.y / scale)}
            sample={sample}
          />
        )}
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

export function Maket() {
  return (
    <main className="mk">
      <header className="mk-head">
        <h1>Макет интерфейса · направление C «Рабочая программа» · графит</h1>
        <p>
          Выбрано окно-панель. Полина стала крупнее примерно на 15%. Курсор — пипетка: рядом с ним цвет комнаты под курсором. Над
          предметами, которые можно будет нажимать, появляется подпись. Это только макет — на сайте ничего не изменилось.
        </p>
      </header>

      <Frame
        title="Окно-панель"
        note="Реплика в отдельной панели программы с заголовком и значками «свернуть / развернуть / закрыть». Ответы — строки, как слои в панели слоёв."
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
        title="Меню и окно раздела"
        note="Меню раскрывается как меню программы, с «горячими клавишами». Раздел открывается окном приложения с заголовком и кнопкой ×."
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
