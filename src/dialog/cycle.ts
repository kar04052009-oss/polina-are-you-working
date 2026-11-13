import type { Line } from '../content/script'

// Варианты реплик идут по кругу: первый клик — первая реплика, второй — вторая…
// Счётчики живут, пока открыта страница.
const counters = new Map<string, number>()

export function nextVariant(key: string, lines: Line[] | undefined): Line | null {
  if (!lines?.length) return null
  const i = counters.get(key) ?? 0
  counters.set(key, i + 1)
  return lines[i % lines.length]
}
