export interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterChipsProps {
  options: FilterOption[]
  active: string
  onChange: (value: string) => void
  /** Names the group for screen readers, e.g. "Filter projects". */
  label: string
}

/** A row of single-select pill toggles, shared by the Projects and Gallery filters. */
export function FilterChips({ options, active, onChange, label }: Readonly<FilterChipsProps>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.value === active
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={[
              'tag-pill transition-colors duration-300 ease-editorial',
              isActive ? 'border-ink bg-ink text-cream' : 'hover:border-ink',
            ].join(' ')}
          >
            {option.label}
            {option.count !== undefined && <span className="ml-1.5 opacity-55">{option.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
