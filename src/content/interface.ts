import { parse } from 'yaml'
import raw from '../../content/interface.yaml?raw'
import type { Section } from './script'

// Надписи интерфейса из content/interface.yaml. Если строчку удалить, останется запасной текст.
const data = (parse(raw) ?? {}) as Record<string, Record<string, string> | undefined>

const pick = (group: string, key: string, fallback: string) => {
  const v = data[group]?.[key]
  return typeof v === 'string' && v.trim() ? v.trim() : fallback
}

export const texts = {
  phone: {
    title: pick('телефон', 'заголовок', 'Загляни ко мне с компьютера'),
    text: pick('телефон', 'текст', 'Мой сайт — маленькая комната, и на большом экране в ней гораздо уютнее.'),
  },
  tablet: {
    title: pick('планшет', 'заголовок', 'Поверни планшет'),
    text: pick('планшет', 'текст', 'Так комната поместится целиком.'),
    hint: pick('планшет', 'подсказка', ''),
  },
  soon: (section: Section) => pick('разделы', section, 'Скоро здесь кое-что появится.'),
}
