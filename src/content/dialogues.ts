import mainRaw from '../../content/dialogues/main.yaml?raw'
import { parseScript } from './script'

// Сценарий уже проверен при сборке, поэтому здесь просто читаем его.
export const mainScript = parseScript(mainRaw)
