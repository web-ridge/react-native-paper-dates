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

const dayLabelOptions: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
  year: 'numeric',
}
type DayLabelParts = {
  days: Map<number, string>
  formatter: Intl.DateTimeFormat
  months: Map<string, readonly Intl.DateTimeFormatPart[] | null>
  weekdays: Map<number, string>
}
const dayLabelParts = new Map<string, DayLabelParts>()

function partOf(
  formatter: Intl.DateTimeFormat,
  date: Date,
  type: Intl.DateTimeFormatPartTypes
) {
  return formatter.formatToParts(date).find((part) => part.type === type)?.value
}

export function formatDayLabel(
  locale: string | undefined,
  year: number,
  month: number,
  day: number
) {
  const key = locale ?? ''
  let cache = dayLabelParts.get(key)
  if (!cache) {
    cache = {
      days: new Map(),
      formatter: dateTimeFormat(locale, dayLabelOptions),
      months: new Map(),
      weekdays: new Map(),
    }
    dayLabelParts.set(key, cache)
  }
  const { formatter } = cache
  const date = new Date(year, month, day)
  const monthKey = `${year}-${month}`
  let template = cache.months.get(monthKey)
  if (template === undefined) {
    template = splitDayPattern(formatter, new Date(year, month, 1))
    cache.months.set(monthKey, template)
  }
  if (!template) return formatter.format(date)

  const weekday = date.getDay()
  let weekdayName = cache.weekdays.get(weekday)
  if (weekdayName === undefined) {
    weekdayName = partOf(formatter, new Date(2024, 0, 7 + weekday), 'weekday')
    if (weekdayName === undefined) return formatter.format(date)
    cache.weekdays.set(weekday, weekdayName)
  }
  let dayName = cache.days.get(day)
  if (dayName === undefined) {
    dayName = partOf(formatter, new Date(2024, 0, day), 'day')
    if (dayName === undefined) return formatter.format(date)
    cache.days.set(day, dayName)
  }
  let label = ''
  for (const part of template) {
    label +=
      part.type === 'weekday'
        ? weekdayName
        : part.type === 'day'
          ? dayName
          : part.value
  }
  return label
}

function splitDayPattern(formatter: Intl.DateTimeFormat, date: Date) {
  if (
    typeof formatter.formatToParts !== 'function' ||
    formatter.resolvedOptions().calendar !== 'gregory'
  ) {
    return null
  }
  const parts = formatter.formatToParts(date)
  const count = (type: Intl.DateTimeFormatPartTypes) =>
    parts.filter((part) => part.type === type).length
  if (count('weekday') !== 1 || count('day') !== 1) return null
  const joined = parts.map((part) => part.value).join('')
  return joined === formatter.format(date) ? parts : null
}
