import { layout } from './layout'
import { polinaSprite } from './assets'

// Вырезанные предметы: content/room/items/<id>.png — PNG того же размера, что и room.png,
// прозрачный везде, кроме предмета. Имена — id из layout.json: cat, mug, window, toys, monitor, moodboard, phone.
// Нужны для подсветки точно по контуру и точного попадания курсором. Если файла нет — работает зона из разметки.
const files = import.meta.glob<string>('/content/room/items/*.png', {
  eager: true,
  import: 'default',
  query: { w: '3960', format: 'webp', quality: '85' },
})

export const cutouts: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace('.png', ''), url]),
)

// Маски прозрачности в уменьшенном виде (в 4 раза) — чтобы быстро понять, попал ли курсор в предмет
type Mask = { alpha: Uint8ClampedArray; w: number; h: number; x: number; y: number; width: number; height: number }
export const masks = new Map<string, Mask>()

function loadMask(id: string, url: string, area: { x: number; y: number; width: number; height: number }) {
  const img = new Image()
  img.onload = () => {
    const w = Math.max(1, Math.round(area.width / 4))
    const h = Math.max(1, Math.round(area.height / 4))
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data
    const alpha = new Uint8ClampedArray(w * h)
    for (let i = 0; i < w * h; i++) alpha[i] = data[i * 4 + 3]
    masks.set(id, { alpha, w, h, ...area })
  }
  img.src = url
}

for (const [id, url] of Object.entries(cutouts)) loadMask(id, url, layout.room)
const sprite = polinaSprite('neutral')
if (sprite) loadMask('polina', sprite, layout.polina)

// Попала ли точка холста в непрозрачную часть маски; undefined — маски нет
export function hitMask(id: string, x: number, y: number): boolean | undefined {
  const m = masks.get(id)
  if (!m) return undefined
  const mx = Math.floor(((x - m.x) / m.width) * m.w)
  const my = Math.floor(((y - m.y) / m.height) * m.h)
  if (mx < 0 || my < 0 || mx >= m.w || my >= m.h) return false
  return m.alpha[my * m.w + mx] > 40
}
