type DayLabelParts = {
  days: Map<number, string>
  formatter: Intl.DateTimeFormat
  months: Map<string, readonly Intl.DateTimeFormatPart[] | null>
  weekdays: Map<number, string>
}

const dayLabelOptions: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
  year: 'numeric',
}

const dayLabelParts = new Map<string, DayLabelParts>()
const formatters = new Map<string, Intl.DateTimeFormat>()
const monthNames = new Map<string, readonly string[]>()

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

export function formatDateRange(
  locale: string | undefined,
  start: Date,
  end: Date,
  options: Intl.DateTimeFormatOptions
) {
  const formatter = dateTimeFormat(locale, options)
  if (typeof formatter.formatRange === 'function') {
    return formatter.formatRange(start, end)
  }
  return formatRangeFromParts(formatter, start, end)
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

function formatRangeFromParts(
  formatter: Intl.DateTimeFormat,
  start: Date,
  end: Date
) {
  if (typeof formatter.formatToParts !== 'function') {
    return `${formatter.format(start)} – ${formatter.format(end)}`
  }

  const startParts = formatter.formatToParts(start)
  const endParts = formatter.formatToParts(end)
  let prefix = 0
  while (
    prefix < startParts.length &&
    prefix < endParts.length &&
    startParts[prefix].type === endParts[prefix].type &&
    startParts[prefix].value === endParts[prefix].value
  ) {
    prefix += 1
  }
  let startSuffix = startParts.length
  let endSuffix = endParts.length
  while (
    startSuffix > prefix &&
    endSuffix > prefix &&
    startParts[startSuffix - 1].type === endParts[endSuffix - 1].type &&
    startParts[startSuffix - 1].value === endParts[endSuffix - 1].value
  ) {
    startSuffix -= 1
    endSuffix -= 1
  }

  const join = (parts: Intl.DateTimeFormatPart[]) =>
    parts.map((part) => part.value).join('')
  const startUnique = join(startParts.slice(prefix, startSuffix))
  const endUnique = join(endParts.slice(prefix, endSuffix))
  if (!startUnique && !endUnique) return formatter.format(start)
  return `${join(startParts.slice(0, prefix))}${startUnique} – ${endUnique}${join(
    startParts.slice(startSuffix)
  )}`
}

function optionsKey(options: Intl.DateTimeFormatOptions): string {
  return Object.keys(options)
    .sort()
    .map((key) => {
      const value = options[key as keyof Intl.DateTimeFormatOptions]
      return `${key}:${String(value)}`
    })
    .join('|')
}

function partOf(
  formatter: Intl.DateTimeFormat,
  date: Date,
  type: Intl.DateTimeFormatPartTypes
) {
  return formatter.formatToParts(date).find((part) => part.type === type)?.value
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
