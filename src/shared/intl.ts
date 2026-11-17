const formatters = new Map<string, Intl.DateTimeFormat>()

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
