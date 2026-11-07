import { existsSync, readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import { parseScript, usedEmotions, ScriptError } from './src/content/script.ts'

const SCRIPT = 'content/dialogues/main.yaml'

// Проверяет сценарий при каждой сборке и при правке файла.
// Ошибка — сборка останавливается, и на сайт ничего не публикуется.
function scriptCheck(): Plugin {
  const check = (ctx: { error: (msg: string) => never; warn: (msg: string) => void }) => {
    try {
      const script = parseScript(readFileSync(SCRIPT, 'utf8'))
      for (const emotion of usedEmotions(script)) {
        if (!existsSync(`content/characters/polina/${emotion}.png`)) {
          ctx.warn(`В сценарии есть эмоция «${emotion}», но файла content/characters/polina/${emotion}.png нет — пока будет neutral.`)
        }
      }
    } catch (e) {
      if (e instanceof ScriptError) ctx.error(e.message)
      throw e
    }
  }
  let dev = false
  return {
    name: 'proverka-scenariya',
    configResolved(config) {
      dev = config.command === 'serve'
    },
    buildStart() {
      check(this)
    },
    // При разработке — ещё и при каждой правке файла (ошибка видна прямо на странице)
    transform(_code, id) {
      if (dev && id.replaceAll('\\', '/').includes(SCRIPT)) check(this)
    },
  }
}

export default defineConfig({
  plugins: [react(), imagetools(), scriptCheck()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
})
