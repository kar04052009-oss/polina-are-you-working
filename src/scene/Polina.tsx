import { layout } from './layout'
import { polinaSprite } from './assets'

// Спрайт эмоции — PNG размером с холст, поэтому кладётся поверх всей сцены без сдвигов.
export function Polina({ emotion = 'neutral' }: { emotion?: string }) {
  const { width: W, height: H } = layout.canvas
  const src = polinaSprite(emotion)
  if (src) return <img src={src} alt="" width={W} height={H} style={{ position: 'absolute', inset: 0 }} />

  const p = layout.polina
  const cx = p.x + p.width / 2
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={cx} cy={p.y + 170} r={150} style={{ fill: 'var(--color-pink)', stroke: 'var(--color-crimson)', strokeWidth: 8 }} />
      <rect x={p.x + 120} y={p.y + 340} width={p.width - 240} height={p.height - 340} rx={160} style={{ fill: 'var(--color-pink)', stroke: 'var(--color-crimson)', strokeWidth: 8 }} />
    </svg>
  )
}
