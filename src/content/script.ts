import { parse } from 'yaml'

// Читает сценарий из main.yaml и проверяет его.
// Используется и на сайте, и при сборке (vite.config.ts) — ошибка в сценарии останавливает публикацию.

export const SECTIONS = ['портфолио', 'обо мне', 'контакты'] as const
export type Section = (typeof SECTIONS)[number]

// Пасхалка в сценарии → id предмета в src/scene/layout.json
export const EASTER_ITEMS: Record<string, string> = { кот: 'cat', кружки: 'mug', окно: 'window', мишки: 'toys', полина: 'polina' }

// Реакции Полины на поведение гостя (заработают на этапе 6)
export const REACTIONS = ['долгая тишина', 'снова осмотр', 'много кликов'] as const
export type Reaction = (typeof REACTIONS)[number]

export type Answer = { text: string; next?: string; section?: Section }
export type Line =
  | { kind: 'line'; emotion?: string; text: string }
  | { kind: 'question'; emotion?: string; text: string; answers: Answer[] }

// В «пасхалках», «перед разделом», «после раздела» и «реакциях» каждая реплика — отдельный вариант:
// на одно событие звучит одна реплика, при следующем — следующая, по кругу.
export type Script = {
  start: string
  returnStart: string
  // Сцена для адреса с опечаткой; после неё — обычное начало
  notFound?: string
  scenes: Record<string, Line[]>
  easter: Record<string, Line[]>
  beforeSection: Partial<Record<Section, Line[]>>
  afterSection: Partial<Record<Section, Line[]>>
  reactions: Partial<Record<Reaction, Line[]>>
}

export class ScriptError extends Error {}

const LINE_KEYS = ['эмоция', 'текст', 'вопрос', 'ответы']
const ANSWER_KEYS = ['текст', 'дальше', 'раздел']
const TOP_KEYS = ['начало', 'повторный визит', 'страница не найдена', 'сцены', 'пасхалки', 'перед разделом', 'после раздела', 'реакции']

type Raw = Record<string, unknown>
const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v)
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''

export function parseScript(source: string): Script {
  const errors: string[] = []

  let raw: unknown
  try {
    raw = parse(source)
  } catch (e) {
    const message = (e as Error).message
    const line = message.match(/at line (\d+)/)?.[1]
    const where = line ? `строка ${line}` : 'место не определено'
    // Самая частая ошибка — двоеточие с пробелом внутри текста
    const hint = /Nested mappings|mapping values|compact mappings/i.test(message)
      ? 'Скорее всего, в тексте есть двоеточие с пробелом. Возьми весь текст в кавычки: текст: "Так: вот."'
      : 'Проверь отступы (пробелы в начале строк) и что каждая реплика начинается с «- ».'
    throw new ScriptError(`Не получается прочитать файл (${where}). ${hint}\nТехнически: ${message.split('\n')[0]}`)
  }
  if (!isObject(raw)) throw new ScriptError('Файл пустой или устроен не так, как в образце.')

  for (const key of Object.keys(raw)) {
    if (!TOP_KEYS.includes(key)) errors.push(`Незнакомое слово «${key}». Возможные: ${TOP_KEYS.join(', ')}.`)
  }

  // Ссылки «дальше:» проверяются в конце, когда известны все сцены
  const refs: { where: string; next: string }[] = []

  const readLines = (where: string, list: unknown): Line[] => {
    if (!Array.isArray(list) || list.length === 0) {
      errors.push(`${where}: нет ни одной реплики.`)
      return []
    }
    return list.flatMap((item, i): Line[] => {
      const at = `${where}, реплика ${i + 1}`
      if (!isObject(item)) {
        errors.push(`${at}: реплика должна начинаться с «- » и содержать «текст:» или «вопрос:».`)
        return []
      }
      for (const key of Object.keys(item)) {
        if (!LINE_KEYS.includes(key)) errors.push(`${at}: незнакомое слово «${key}». Возможные: ${LINE_KEYS.join(', ')}.`)
      }
      const emotion = item['эмоция'] === undefined ? undefined : String(item['эмоция']).trim()

      if (item['вопрос'] !== undefined) {
        if (!isText(item['вопрос'])) errors.push(`${at}: вопрос пустой.`)
        if (item['текст'] !== undefined) errors.push(`${at}: у вопроса не нужно «текст:» — сам вопрос пишется после «вопрос:».`)
        const answers = item['ответы']
        if (!Array.isArray(answers) || answers.length === 0) {
          errors.push(`${at}: у вопроса нет ответов.`)
          return []
        }
        const parsed = answers.flatMap((a, j): Answer[] => {
          const aAt = `${at}, ответ ${j + 1}`
          if (!isObject(a)) {
            errors.push(`${aAt}: ответ должен содержать «текст:» и «дальше:» или «раздел:».`)
            return []
          }
          for (const key of Object.keys(a)) {
            if (!ANSWER_KEYS.includes(key)) errors.push(`${aAt}: незнакомое слово «${key}». Возможные: ${ANSWER_KEYS.join(', ')}.`)
          }
          if (!isText(a['текст'])) errors.push(`${aAt}: нет текста кнопки.`)
          const next = a['дальше']
          const section = a['раздел']
          if ((next === undefined) === (section === undefined)) {
            errors.push(`${aAt}: нужно ровно одно — «дальше:» или «раздел:».`)
          }
          if (section !== undefined && !SECTIONS.includes(section as Section)) {
            errors.push(`${aAt}: нет раздела «${section}». Возможные: ${SECTIONS.join(', ')}.`)
          }
          if (next !== undefined) refs.push({ where: `${at}, ответ «${a['текст']}»`, next: String(next) })
          return [{ text: String(a['текст'] ?? ''), next: next === undefined ? undefined : String(next), section: section as Section | undefined }]
        })
        return [{ kind: 'question', emotion, text: String(item['вопрос'] ?? ''), answers: parsed }]
      }

      if (item['ответы'] !== undefined) errors.push(`${at}: «ответы:» бывают только у реплики с «вопрос:».`)
      if (!isText(item['текст'])) {
        errors.push(`${at}: нет текста реплики.`)
        return []
      }
      return [{ kind: 'line', emotion, text: item['текст'] }]
    })
  }

  const scenes: Record<string, Line[]> = {}
  if (!isObject(raw['сцены'])) errors.push('Нет раздела «сцены:».')
  else for (const [name, list] of Object.entries(raw['сцены'])) scenes[name] = readLines(`Сцена «${name}»`, list)

  // Группа реплик-вариантов с заранее известными названиями (пасхалки, разделы, реакции)
  const readGroup = (key: string, allowed: readonly string[], what: string) => {
    const out: Record<string, Line[]> = {}
    const group = raw[key]
    if (group === undefined) return out
    if (!isObject(group)) {
      errors.push(`«${key}:» устроено не так, как в образце.`)
      return out
    }
    for (const [name, list] of Object.entries(group)) {
      if (!allowed.includes(name)) errors.push(`«${key}» → «${name}»: нет такого ${what}. Возможные: ${allowed.join(', ')}.`)
      out[name] = readLines(`«${key}» → «${name}»`, list)
    }
    return out
  }
  const easter = readGroup('пасхалки', Object.keys(EASTER_ITEMS), 'предмета')
  const beforeSection = readGroup('перед разделом', SECTIONS, 'раздела')
  const afterSection = readGroup('после раздела', SECTIONS, 'раздела')
  const reactions = readGroup('реакции', REACTIONS, 'реакции')

  // Ссылки на сцены
  const sceneExists = (name: unknown, where: string) => {
    if (!isText(name)) errors.push(`${where}: не указано, с какой сцены начинать.`)
    else if (!(name in scenes)) errors.push(`${where}: нет сцены «${name}». Есть: ${Object.keys(scenes).join(', ')}.`)
  }
  sceneExists(raw['начало'], '«начало»')
  sceneExists(raw['повторный визит'], '«повторный визит»')
  if (raw['страница не найдена'] !== undefined) sceneExists(raw['страница не найдена'], '«страница не найдена»')
  for (const { where, next } of refs) {
    if (!(next in scenes)) errors.push(`${where}: нет сцены «${next}». Есть: ${Object.keys(scenes).join(', ')}.`)
  }

  if (errors.length) throw new ScriptError(`Ошибки в сценарии content/dialogues/main.yaml:\n- ${errors.join('\n- ')}`)

  return {
    start: String(raw['начало']),
    returnStart: String(raw['повторный визит']),
    notFound: raw['страница не найдена'] === undefined ? undefined : String(raw['страница не найдена']),
    scenes,
    easter,
    beforeSection,
    afterSection,
    reactions,
  }
}

// Все эмоции, которые встречаются в сценарии (для проверки, есть ли файлы спрайтов)
export function usedEmotions(script: Script): string[] {
  const groups = [script.scenes, script.easter, script.beforeSection, script.afterSection, script.reactions]
  const all = groups.flatMap((g) => Object.values(g)).flat() as Line[]
  return [...new Set(all.map((l) => l.emotion).filter((e): e is string => !!e))]
}
