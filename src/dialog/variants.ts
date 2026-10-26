// Временные варианты для выбора на этапе 3. После выбора Полины лишние уберём.
const params = new URLSearchParams(window.location.search)

export type BoxStyle = 'a' | 'b' | 'c'
export type Appear = 'a' | 'b'

const pick = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
  const v = params.get(key) as T | null
  return v && allowed.includes(v) ? v : fallback
}

export const boxStyle = pick<BoxStyle>('okno', ['a', 'b', 'c'], 'a')
export const appear = pick<Appear>('poyavlenie', ['a', 'b'], 'a')
const speed = pick('skorost', ['1', '2', '3'] as const, '2')

// Знаков в секунду
export const typingSpeed = { '1': 60, '2': 35, '3': 20 }[speed]
export const speedKey = speed
export const showVariantPanel = params.has('varianty')

export const variantOptions = {
  okno: [
    ['a', 'Кремовая карточка'],
    ['b', 'Матовое стекло'],
    ['c', 'Тёплая вуаль'],
  ],
  skorost: [
    ['1', 'Быстро'],
    ['2', 'Средне'],
    ['3', 'Медленно'],
  ],
  poyavlenie: [
    ['a', 'Проявляется'],
    ['b', 'Выезжает снизу'],
  ],
} as const
