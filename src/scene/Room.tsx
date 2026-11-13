import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { layout, type Item } from './layout'
import { roomImage } from './assets'
import { onScreen, useStageScale, zoomTo } from './useStageScale'
import { RoomPlaceholder } from './RoomPlaceholder'
import { Polina } from './Polina'
import { Highlight } from './Highlight'
import { MarkupOverlay } from './MarkupOverlay'
import { Pipette, hasMouse } from './Pipette'
import { itemAt } from './hitTest'
import { Dialog, type DialogHandle } from '../dialog/Dialog'
import { nextVariant } from '../dialog/cycle'
import { mainScript } from '../content/dialogues'
import { EASTER_ITEMS, type Line, type Section } from '../content/script'
import { Menu } from '../menu/Menu'
import { SectionWindow } from '../sections/SectionWindow'
import { MonitorDesk } from '../sections/MonitorDesk'
import { closeSection, openSection, useRoute } from '../router/routes'
import './Room.css'

const showMarkup = new URLSearchParams(window.location.search).has('razmetka')

// Предметы, которые открывают разделы
const ITEM_SECTIONS: Record<string, Section> = { monitor: 'портфолио', moodboard: 'обо мне', phone: 'контакты' }
// id предмета → название пасхалки в сценарии
const ITEM_EASTER = Object.fromEntries(Object.entries(EASTER_ITEMS).map(([name, id]) => [id, name]))

// Реакции: «долгая тишина» и «много кликов»
const IDLE_AFTER = 40_000
const IDLE_REPEAT = 60_000
const MANY_CLICKS = 4
const MANY_CLICKS_WINDOW = 10_000

// Камера: плавное приближение к монитору ~1,2 с, в конце вспышка экрана (вариант C)
const ZOOM = { duration: 1.2, ease: [0.65, 0, 0.35, 1] as const }
type Camera = 'room' | 'in' | 'screen' | 'out'

export function Room() {
  const fit = useStageScale()
  const route = useRoute()
  const [emotion, setEmotion] = useState('neutral')
  // «Начать сначала» пересоздаёт диалог с первой реплики знакомства
  const [restarts, setRestarts] = useState(0)
  const restarting = useRef(false)
  // Адрес с опечаткой запоминаем один раз — при первом открытии
  const [notFound] = useState(route.notFound)
  const dialog = useRef<DialogHandle>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)

  // --- Камера ---
  const portfolio = route.section === 'портфолио'
  // По прямой ссылке /portfolio сайт открывается уже приближенным, без анимации
  const [camera, setCamera] = useState<Camera>(portfolio ? 'screen' : 'room')
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (portfolio && (camera === 'room' || camera === 'out')) setCamera('in')
    if (!portfolio && (camera === 'in' || camera === 'screen')) setCamera('out')
  }, [portfolio, camera])
  const zoomed = camera === 'in' || camera === 'screen'
  const view = zoomed ? zoomTo(layout.monitorScreen) : fit
  const screenRect = onScreen(layout.monitorScreen, zoomTo(layout.monitorScreen))
  const inRoom = camera === 'room' && !route.section

  // --- Реплики ---
  const say = (line: Line | null, options?: { then?: () => void; auto?: boolean }) => {
    if (line) dialog.current?.say(line, options)
    else options?.then?.()
  }

  // «После раздела»: гость закрыл раздел. У портфолио — когда камера отъехала.
  const prevSection = useRef(route.section)
  useEffect(() => {
    const prev = prevSection.current
    prevSection.current = route.section
    if (!prev || route.section || restarting.current) return
    if (prev !== 'портфолио') say(nextVariant(`после раздела:${prev}`, mainScript.afterSection[prev]))
  }, [route.section])

  // Камера доехала. Проверяем, что закончилось именно нужное движение (к монитору или обратно),
  // а не случайное мгновенное — например, при изменении размера окна.
  const onCameraDone = (done: unknown) => {
    const scale = (done as { scale?: number })?.scale
    if (typeof scale !== 'number' || Math.abs(scale - view.scale) > 0.001) return
    if (camera === 'in') {
      setFlash(true)
      setCamera('screen')
    } else if (camera === 'out') {
      setCamera('room')
      if (!restarting.current) say(nextVariant('после раздела:портфолио', mainScript.afterSection['портфолио']))
    }
  }

  const restart = useCallback(() => {
    restarting.current = true
    if (route.section) closeSection()
    setEmotion('neutral')
    setRestarts((n) => n + 1)
    setTimeout(() => (restarting.current = false), 1500)
  }, [route.section])

  // --- Клики по предметам ---
  const clicks = useRef<number[]>([])
  const activate = (item: Item) => {
    // «Много кликов»: 4 предмета за 10 секунд
    const now = Date.now()
    clicks.current = [...clicks.current.filter((t) => now - t < MANY_CLICKS_WINDOW), now]
    if (clicks.current.length >= MANY_CLICKS && mainScript.reactions['много кликов']) {
      clicks.current = []
      return say(nextVariant('реакции:много кликов', mainScript.reactions['много кликов']))
    }
    const section = ITEM_SECTIONS[item.id]
    if (section) {
      return say(nextVariant(`перед разделом:${section}`, mainScript.beforeSection[section]), {
        then: () => openSection(section),
        auto: true,
      })
    }
    const easter = ITEM_EASTER[item.id]
    if (easter) say(nextVariant(`пасхалки:${easter}`, mainScript.easter[easter]))
  }

  const toCanvas = (e: { clientX: number; clientY: number }) => ({
    x: (e.clientX - view.left) / view.scale,
    y: (e.clientY - view.top) / view.scale,
  })

  const onStageClick = (e: ReactMouseEvent) => {
    if (!inRoom || (e.target as HTMLElement).closest('.dialog')) return
    const { x, y } = toCanvas(e)
    const item = itemAt(x, y)
    if (!item) {
      setHovered(null)
      return
    }
    // Клик по предмету не листает диалог
    e.stopPropagation()
    // На планшете первое касание показывает подсветку и подпись, второе — нажимает
    if (!hasMouse && hovered !== item.id) return setHovered(item.id)
    activate(item)
  }

  const onMove = (e: ReactMouseEvent) => {
    if (showMarkup) setCursor({ x: Math.round((e.clientX - fit.left) / fit.scale), y: Math.round((e.clientY - fit.top) / fit.scale) })
    if (!hasMouse) return
    if (!inRoom || (e.target as HTMLElement).closest('.dialog, .menu')) return setHovered(null)
    const { x, y } = toCanvas(e)
    setHovered(itemAt(x, y)?.id ?? null)
  }

  // --- «Долгая тишина» ---
  const lastActivity = useRef(Date.now())
  const lastIdleLine = useRef(0)
  useEffect(() => {
    const touch = () => (lastActivity.current = Date.now())
    const events = ['pointerdown', 'keydown', 'pointermove', 'wheel'] as const
    events.forEach((ev) => window.addEventListener(ev, touch, { passive: true }))
    const timer = setInterval(() => {
      const now = Date.now()
      if (!inRoom || now - lastActivity.current < IDLE_AFTER || now - lastIdleLine.current < IDLE_REPEAT) return
      lastIdleLine.current = now
      say(nextVariant('реакции:долгая тишина', mainScript.reactions['долгая тишина']))
    }, 5000)
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, touch))
      clearInterval(timer)
    }
  }, [inRoom])

  const { width: W, height: H } = layout.canvas
  const room = layout.room
  const touchItem = !hasMouse && hovered ? layout.items.find((i) => i.id === hovered) : undefined

  return (
    <div
      className={`room ${hasMouse && inRoom ? 'room--pipette' : ''}`}
      onMouseMove={onMove}
      onMouseLeave={() => setHovered(null)}
      style={roomImage ? { background: layout.room.edgeColor } : undefined}
    >
      <motion.div
        className="room__stage"
        style={{ width: W, height: H, originX: 0, originY: 0 }}
        initial={false}
        animate={{ x: view.left, y: view.top, scale: view.scale }}
        transition={camera === 'in' || camera === 'out' ? ZOOM : { duration: 0 }}
        onAnimationComplete={onCameraDone}
        onClick={onStageClick}
      >
        {roomImage ? (
          <img src={roomImage} alt="" className="room__bg" style={{ left: room.x, top: room.y, width: room.width, height: room.height }} />
        ) : (
          <RoomPlaceholder />
        )}
        <Highlight id={inRoom ? hovered : null} />
        <Polina emotion={emotion} />

        {/* Предметы для клавиатуры: Tab — по предметам, Enter — нажать. Мышью их не видно и не нажать. */}
        {layout.items.map((it) => (
          <button
            key={it.id}
            className="room__item"
            style={{ left: it.x, top: it.y, width: it.width, height: it.height }}
            aria-label={ITEM_SECTIONS[it.id] ? `${it.label} — открыть «${it.goal}»` : it.label}
            tabIndex={inRoom ? 0 : -1}
            onFocus={() => setHovered(it.id)}
            onBlur={() => setHovered(null)}
            onClick={(e) => {
              e.stopPropagation()
              activate(it)
            }}
          />
        ))}

        {/* Подпись на планшете (на компьютере её показывает пипетка) */}
        {touchItem && inRoom && (
          <div className="room__touch-label" style={{ left: touchItem.x, top: touchItem.y - 70 }}>
            {touchItem.label}
            {touchItem.kind === 'section' && <em> · {touchItem.goal}</em>}
          </div>
        )}

        <motion.div
          style={{ position: 'absolute', inset: 0, pointerEvents: camera === 'room' ? 'auto' : 'none' }}
          animate={{ opacity: camera === 'room' ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Dialog
            key={restarts}
            ref={dialog}
            onEmotion={setEmotion}
            onSection={openSection}
            paused={route.section !== null}
            fromStart={restarts > 0}
            notFound={notFound && restarts === 0}
          />
        </motion.div>

        <AnimatePresence>
          {route.section && route.section !== 'портфолио' && (
            <SectionWindow key={route.section} section={route.section} onClose={closeSection} />
          )}
        </AnimatePresence>
        {showMarkup && <MarkupOverlay />}
      </motion.div>

      {/* Вспышка экрана в конце приближения и Портфолио внутри монитора */}
      <AnimatePresence>
        {flash && (
          <motion.div
            className="monitor-flash"
            style={screenRect}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 0.5, times: [0, 0.35, 1] }}
            onAnimationComplete={() => setFlash(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{camera === 'screen' && portfolio && <MonitorDesk rect={screenRect} onClose={closeSection} />}</AnimatePresence>

      <Menu onRestart={restart} />
      {hasMouse && inRoom && <Pipette scale={view.scale} left={view.left} top={view.top} />}

      {showMarkup && (
        <div className="room__readout">
          <div>Курсор на холсте: {cursor ? `x ${cursor.x}, y ${cursor.y}` : 'наведите на сцену'}</div>
          <div>
            Окно {window.innerWidth}×{window.innerHeight} · масштаб {Math.round(fit.scale * 100)}%
          </div>
        </div>
      )}
    </div>
  )
}
