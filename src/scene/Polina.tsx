import { useState } from 'react'
import { motion } from 'motion/react'
import { layout } from './layout'
import { polinaSprite } from './assets'

// Спрайт эмоции ставится в зону polina из layout.json.
// Низ спрайта плавно растворяется за диалоговым окном, и обрез фигуры не виден.
// Растворение привязано к окну, а не к размеру спрайта: Полину можно увеличивать, обрез всё равно спрячется.
const p = layout.polina
const box = layout.dialogBox
const fadeFrom = box.y + 40 - p.y
const fadeTo = box.y + box.height - 40 - p.y
const fadeBottom = `linear-gradient(to bottom, black ${fadeFrom}px, transparent ${fadeTo}px)`

// Смена эмоции — мягкое наложение за 0,35 с (вариант A, выбран 2026-11-15).
// Новое лицо проявляется за 0,25 с, прежнее с задержкой 0,1 с растворяется за 0,25 с:
// тело почти не просвечивает, а руки в разных позах перетекают плавно, без «призрака» прежней позы.
const FADE_IN = 0.25
const FADE_OUT_DELAY = 0.1
const FADE_OUT = 0.25

const spriteStyle = {
  position: 'absolute' as const,
  left: p.x,
  top: p.y,
  width: p.width,
  height: p.height,
  maskImage: fadeBottom,
  WebkitMaskImage: fadeBottom,
}

export function Polina({ emotion = 'neutral' }: { emotion?: string }) {
  const { width: W, height: H } = layout.canvas
  // Если файла нужной эмоции ещё нет — показываем neutral
  const src = polinaSprite(emotion) ?? polinaSprite('neutral')

  const [layers, setLayers] = useState<{ prev: string | null; cur: string | undefined }>({ prev: null, cur: src })
  if (src !== layers.cur) setLayers({ prev: layers.cur ?? null, cur: src })

  if (layers.cur) {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {layers.prev && (
          <motion.img
            key={layers.prev}
            src={layers.prev}
            alt=""
            style={spriteStyle}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: FADE_OUT, delay: FADE_OUT_DELAY, ease: 'easeInOut' }}
            onAnimationComplete={() => setLayers((l) => (l.prev ? { ...l, prev: null } : l))}
          />
        )}
        <motion.img
          key={layers.cur}
          src={layers.cur}
          alt=""
          style={spriteStyle}
          initial={layers.prev ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: FADE_IN, ease: 'easeOut' }}
        />
      </div>
    )
  }

  const cx = p.x + p.width / 2
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={cx} cy={p.y + 170} r={150} style={{ fill: 'var(--ui-bar)', stroke: 'var(--ui-line)', strokeWidth: 8 }} />
      <rect x={p.x + 120} y={p.y + 340} width={p.width - 240} height={p.height - 340} rx={160} style={{ fill: 'var(--ui-bar)', stroke: 'var(--ui-line)', strokeWidth: 8 }} />
    </svg>
  )
}
