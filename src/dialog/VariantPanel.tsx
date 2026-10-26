import { variantOptions } from './variants'

// Панель сравнения вариантов (?varianty). Временная, только для выбора на этапе 3.
export function VariantPanel() {
  const params = new URLSearchParams(window.location.search)
  const current = (key: string, fallback: string) => params.get(key) ?? fallback
  const defaults: Record<string, string> = { okno: 'a', skorost: '2', poyavlenie: 'a' }
  const titles: Record<string, string> = { okno: 'Окно', skorost: 'Скорость', poyavlenie: 'Появление' }

  const go = (key: string, value: string) => {
    params.set(key, value)
    window.location.search = params.toString()
  }

  return (
    <div className="variant-panel" onClick={(e) => e.stopPropagation()}>
      {Object.entries(variantOptions).map(([key, options]) => (
        <div key={key} className="variant-panel__row">
          <span className="variant-panel__title">{titles[key]}</span>
          {options.map(([value, label]) => (
            <button
              key={value}
              className={current(key, defaults[key]) === value ? 'is-active' : ''}
              onClick={() => go(key, value)}
            >
              {label}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
