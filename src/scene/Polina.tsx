import { layout } from './layout'
import { polinaSprite } from './assets'

// Спрайт эмоции ставится в зону polina из layout.json.
// Низ спрайта плавно растворяется: он уходит за диалоговое окно, и обрез фигуры не виден.
const fadeBottom = 'linear-gradient(to bottom, black 80%, transparent 97%)'

export function Polina({ emotion = 'neutral' }: { emotion?: string }) {
  const { width: W, height: H } = layout.canvas
  const p = layout.polina
  const src = polinaSprite(emotion)

  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{
          position: 'absolute',
          left: p.x,
          top: p.y,
          width: p.width,
          height: p.height,
          maskImage: fadeBottom,
          WebkitMaskImage: fadeBottom,
        }}
      />
    )
  }

  const cx = p.x + p.width / 2
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={cx} cy={p.y + 170} r={150} style={{ fill: 'var(--color-pink)', stroke: 'var(--color-crimson)', strokeWidth: 8 }} />
      <rect x={p.x + 120} y={p.y + 340} width={p.width - 240} height={p.height - 340} rx={160} style={{ fill: 'var(--color-pink)', stroke: 'var(--color-crimson)', strokeWidth: 8 }} />
    </svg>
  )
}
