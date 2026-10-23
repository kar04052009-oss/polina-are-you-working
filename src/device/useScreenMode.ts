import { useEffect, useState } from 'react'

export type ScreenMode = 'full' | 'rotate' | 'phone'

// Полный сайт: окно от 1024×600 и горизонтальное.
// Вертикальный планшет (сенсорный экран, который после поворота подойдёт) → просьба повернуть.
// Всё остальное → заглушка для телефонов. Мобильную версию позже можно подключить вместо неё.
function detect(): ScreenMode {
  const w = window.innerWidth
  const h = window.innerHeight
  if (w >= 1024 && h >= 600 && w > h) return 'full'
  const touch = window.matchMedia('(pointer: coarse)').matches
  if (touch && h >= 1024 && w >= 600) return 'rotate'
  return 'phone'
}

export function useScreenMode() {
  const [mode, setMode] = useState(detect)
  useEffect(() => {
    const update = () => setMode(detect())
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])
  return mode
}
