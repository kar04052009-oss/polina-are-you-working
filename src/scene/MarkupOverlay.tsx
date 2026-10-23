import { box, layout, type Item, type Rect } from './layout'

const blue = '#3f7fbf'
const beige = '#a07e58'
const green = '#2e9e7a'
const crimson = 'var(--color-crimson)'

function Box({ r, color, dash, title, sub, bottom }: { r: Rect; color: string; dash?: string; title: string; sub?: string; bottom?: boolean }) {
  // bottom — подпись внизу зоны, когда сверху её закрыла бы соседняя подпись
  const ty = bottom ? r.y + r.height - 50 : r.y + 40
  return (
    <g>
      <rect {...box(r)} style={{ fill: color, fillOpacity: 0.12, stroke: color, strokeWidth: 5, strokeDasharray: dash }} />
      <text x={r.x + 12} y={ty} style={{ fill: color, fontSize: 32, fontWeight: 700 }}>{title}</text>
      <text x={r.x + 12} y={ty + 34} style={{ fill: color, fontSize: 24 }}>
        {sub ? `${sub} · ` : ''}
        {r.x}, {r.y} · {r.width}×{r.height}
      </text>
    </g>
  )
}

function ItemShape({ it }: { it: Item }) {
  const color = it.kind === 'section' ? blue : beige
  if (!it.points) {
    return <Box r={it} color={color} dash={it.kind === 'easter' ? '14 8' : undefined} title={it.label} sub={`→ ${it.goal}`} />
  }
  return (
    <g>
      <polygon points={it.points.map((p) => p.join(',')).join(' ')} style={{ fill: color, fillOpacity: 0.12, stroke: color, strokeWidth: 5 }} />
      <text x={it.points[0][0]} y={it.points[0][1] - 12} style={{ fill: color, fontSize: 32, fontWeight: 700 }}>
        {it.label} → {it.goal}
      </text>
    </g>
  )
}

// Режим ?razmetka: поверх сцены видны все зоны из layout.json.
export function MarkupOverlay() {
  const { width: W, height: H } = layout.canvas
  const m = layout.main
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: 'var(--font-main)' }}
    >
      <path
        d={`M0 0H${W}V${H}H0Z M${m.x} ${m.y}V${m.y + m.height}H${m.x + m.width}V${m.y}Z`}
        style={{ fill: '#000', fillOpacity: 0.18, fillRule: 'evenodd' }}
      />
      <rect {...box(m)} style={{ fill: 'none', stroke: crimson, strokeWidth: 8 }} />
      <text x={m.x + 16} y={m.y + 44} style={{ fill: crimson, fontSize: 32, fontWeight: 700 }}>
        Основная зона 2560×1440 · за её пределами — запас
      </text>
      <line x1={W / 2} y1={0} x2={W / 2} y2={H} style={{ stroke: '#000', strokeOpacity: 0.3, strokeWidth: 2, strokeDasharray: '12 12' }} />
      <line x1={0} y1={H / 2} x2={W} y2={H / 2} style={{ stroke: '#000', strokeOpacity: 0.3, strokeWidth: 2, strokeDasharray: '12 12' }} />
      <Box r={layout.polina} color={crimson} dash="30 14" title="Полина" />
      {layout.items.map((it) => (
        <ItemShape key={it.id} it={it} />
      ))}
      <Box r={layout.monitorScreen} color={green} title="Экран монитора" sub="сюда приближается камера" bottom />
      <Box r={layout.dialog} color={crimson} title="Диалоговое окно" />
    </svg>
  )
}
