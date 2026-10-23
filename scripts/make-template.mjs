// Рисует шаблон холста для Photoshop из src/scene/layout.json.
// Запуск: npm run template → файлы в design/template/
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const L = JSON.parse(readFileSync(new URL('../src/scene/layout.json', import.meta.url), 'utf8'))
const { width: W, height: H } = L.canvas
const out = new URL('../design/template/', import.meta.url)
mkdirSync(out, { recursive: true })

const C = { crimson: '#C2456F', pink: '#FFB8CB', beige: '#B89A78', gray: '#7A6A70', blue: '#3F7FBF' }
const font = `font-family="Segoe UI, Arial, sans-serif"`

function rect(r, { stroke, fill = 'none', fillOpacity = 0, dash = '', sw = 4 }) {
  return `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${fill}" fill-opacity="${fillOpacity}" stroke="${stroke}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`
}
function text(x, y, s, { size = 32, color = C.gray, weight = 400, anchor = 'start' } = {}) {
  return `<text x="${x}" y="${y}" ${font} font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${s}</text>`
}
const coords = (r) => `${r.x}, ${r.y} · ${r.width}×${r.height}`

function build(filled) {
  const f = (o) => (filled ? o : 0)
  const m = L.main
  const parts = []

  // Запас по краям (вне основной зоны)
  parts.push(`<path d="M0 0H${W}V${H}H0Z M${m.x} ${m.y}V${m.y + m.height}H${m.x + m.width}V${m.y}Z" fill="${C.gray}" fill-opacity="${f(0.18)}" fill-rule="evenodd"/>`)
  parts.push(rect({ x: 2, y: 2, width: W - 4, height: H - 4 }, { stroke: C.gray, sw: 4 }))
  parts.push(text(24, 56, 'Холст 3360×1600 · серое — запас для широких экранов', { size: 30 }))

  // Центральные оси
  parts.push(`<line x1="${W / 2}" y1="0" x2="${W / 2}" y2="${H}" stroke="${C.gray}" stroke-width="2" stroke-dasharray="12 12"/>`)
  parts.push(`<line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="${C.gray}" stroke-width="2" stroke-dasharray="12 12"/>`)

  // Основная зона
  parts.push(rect(m, { stroke: C.crimson, sw: 8 }))
  parts.push(text(m.x + 20, m.y + 50, `Основная зона 2560×1440 — видна всегда · ${m.x}, ${m.y}`, { size: 34, color: C.crimson, weight: 700 }))

  // Стол
  const d = L.desk
  parts.push(rect(d, { stroke: C.beige, fill: C.beige, fillOpacity: f(0.15), dash: '24 12', sw: 3 }))
  parts.push(text(d.x + 420, d.y + 60, 'стол (примерно)', { size: 30, color: C.beige }))

  // Полина
  const p = L.polina
  parts.push(rect(p, { stroke: C.crimson, fill: C.pink, fillOpacity: f(0.35), dash: '30 14', sw: 5 }))
  parts.push(text(p.x + p.width / 2, p.y + 70, 'Полина', { size: 48, color: C.crimson, weight: 700, anchor: 'middle' }))
  parts.push(text(p.x + p.width / 2, p.y + 115, coords(p), { size: 28, color: C.crimson, anchor: 'middle' }))
  parts.push(text(p.x + p.width / 2, p.y + 155, 'низ фигуры уходит за диалоговое окно', { size: 26, color: C.crimson, anchor: 'middle' }))

  // Предметы
  for (const it of L.items) {
    const isSection = it.kind === 'section'
    const color = isSection ? C.blue : C.beige
    parts.push(rect(it, { stroke: color, fill: color, fillOpacity: f(0.22), sw: isSection ? 5 : 4, dash: isSection ? '' : '14 8' }))
    // У маленьких предметов подпись стоит над ними, чтобы не наезжать на соседей
    const small = it.width < 300
    const lx = small ? it.x : it.x + 16
    const ly = small ? it.y - 92 : it.y + 44
    parts.push(text(lx, ly, it.label, { size: 34, color, weight: 700 }))
    parts.push(text(lx, ly + 38, `→ ${it.goal}`, { size: 28, color }))
    parts.push(text(lx, ly + 72, coords(it), { size: 24, color }))
  }

  // Диалоговое окно
  const g = L.dialog
  parts.push(rect(g, { stroke: C.crimson, fill: C.crimson, fillOpacity: f(0.16), sw: 6 }))
  parts.push(text(g.x + g.width / 2, g.y + 160, 'Зона диалогового окна — нижняя четверть основной зоны', { size: 44, color: C.crimson, weight: 700, anchor: 'middle' }))
  parts.push(text(g.x + g.width / 2, g.y + 215, `${coords(g)} · кликабельные предметы сюда не ставить`, { size: 30, color: C.crimson, anchor: 'middle' }))

  // Легенда
  parts.push(text(W - 24, 56, 'синие — разделы · бежевые пунктиром — пасхалки', { size: 30, anchor: 'end' }))

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n${parts.join('\n')}\n</svg>\n`
}

for (const [name, filled] of [['razmetka-holsta', true], ['razmetka-holsta-linii', false]]) {
  const svg = build(filled)
  writeFileSync(new URL(`${name}.svg`, out), svg)
  const png = new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'Segoe UI' } }).render().asPng()
  writeFileSync(new URL(`${name}.png`, out), png)
  console.log(`design/template/${name}.png и .svg`)
}
