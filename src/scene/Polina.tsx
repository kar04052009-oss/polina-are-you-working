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

// Временный выбор смены эмоций на черновике: ?emocii=a|b|c. После выбора лишнее уберём.
// A — наложение 0,35 с; B — медленное наложение 0,6 с; C — наложение 0,35 с и лёгкий «вдох».
const variant = (['a', 'b', 'c'] as const).find((v) => v === new URLSearchParams(window.location.search).get('emocii')) ?? 'a'
const FADE = variant === 'b' ? 0.6 : 0.35

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

  // Прежнее лицо остаётся непрозрачным под новым, пока новое проявляется, —
  // так сквозь Полину не просвечивает комната. Потом прежнее убирается.
  const [layers, setLayers] = useState<{ prev: string | null; cur: string | undefined }>({ prev: null, cur: src })
  if (src !== layers.cur) setLayers({ prev: layers.cur ?? null, cur: src })

  if (layers.cur) {
    return (
      <motion.div
        key={variant === 'c' ? layers.cur : 'polina'}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        // Вариант C: фигура чуть приподнимается и опускается при смене эмоции
        initial={variant === 'c' && layers.prev ? { y: 0 } : false}
        animate={variant === 'c' && layers.prev ? { y: [0, -8, 0] } : { y: 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      >
        {layers.prev && <img src={layers.prev} alt="" style={spriteStyle} />}
        <motion.img
          key={layers.cur}
          src={layers.cur}
          alt=""
          style={spriteStyle}
          initial={layers.prev ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: FADE, ease: 'easeInOut' }}
          onAnimationComplete={() => setLayers((l) => (l.prev ? { ...l, prev: null } : l))}
        />
      </motion.div>
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
