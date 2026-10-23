// Картинки подхватываются сами, если положить файл в нужное место.
// Пока файлов нет — на сайте рисуются заглушки.

const rooms = import.meta.glob<string>('/content/room/background.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})
const sprites = import.meta.glob<string>('/content/characters/polina/*.png', {
  eager: true,
  import: 'default',
})

export const roomImage: string | undefined = Object.values(rooms)[0]

export function polinaSprite(emotion: string): string | undefined {
  return sprites[`/content/characters/polina/${emotion}.png`]
}
