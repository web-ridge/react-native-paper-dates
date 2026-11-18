const formatters = new Map<string, Intl.DateTimeFormat>()
const monthNames = new Map<string, readonly string[]>()

function optionsKey(options: Intl.DateTimeFormatOptions): string {
  return Object.keys(options)
    .sort()
    .map((key) => {
      const value = options[key as keyof Intl.DateTimeFormatOptions]
      return `${key}:${String(value)}`
    })
    .join('|')
}

export function dateTimeFormat(
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = `${locale ?? ''}\0${optionsKey(options)}`
  const cached = formatters.get(key)
  if (cached) return cached

  const formatter = new Intl.DateTimeFormat(locale, options)
  formatters.set(key, formatter)
  return formatter
}

export function formatMonth(locale: string | undefined, month: number) {
  const key = locale ?? ''
  let names = monthNames.get(key)
  if (!names) {
    const formatter = dateTimeFormat(locale, { month: 'long' })
    names = Array.from({ length: 12 }, (_, index) =>
      formatter.format(new Date(2020, index, 1))
    )
    monthNames.set(key, names)
  }
  return names[month]
}
