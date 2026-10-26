// Картинки подхватываются сами, если положить файл в нужное место.
// Пока файлов нет — на сайте рисуются заглушки.

// Исходник комнаты огромный, поэтому при сборке он уменьшается и сжимается в WebP.
// Ширина 3960 — с запасом для экранов 4K (основная зона 2560 × 1,5).
const rooms = import.meta.glob<string>('/content/room/room.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
  query: { w: '3960', format: 'webp', quality: '85' },
})
// Спрайты тоже сжимаются в WebP; прозрачность сохраняется.
const sprites = import.meta.glob<string>('/content/characters/polina/*.png', {
  eager: true,
  import: 'default',
  query: { format: 'webp', quality: '90' },
})

export const roomImage: string | undefined = Object.values(rooms)[0]

export function polinaSprite(emotion: string): string | undefined {
  return sprites[`/content/characters/polina/${emotion}.png`]
}
