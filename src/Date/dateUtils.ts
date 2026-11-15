import { useCallback, useMemo } from 'react'

import type { DisableWeekDaysType, ValidRangeType } from './types'

export type { DisableWeekDaysType }
export type TypedDateIssue = 'disabled' | 'format' | 'range'

export const dayCellSize = 48
export const daySize = 40
export const defaultEndYear = 2200
export const defaultStartYear = 1800
export const estimatedMonthHeight = 400
const nativeDigits: Record<string, string> = {}
const startAtIndexCache = new Map<string, number>()
for (const [index, digit] of '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹'.split('').entries()) {
  nativeDigits[digit] = String(index % 10)
}

export function addMonths(date: Date, count: number) {
  const n = date.getDate()
  let n2 = new Date(date.getTime())
  n2.setDate(1)
  n2.setMonth(n2.getMonth() + count)
  n2.setDate(
    Math.min(
      n,
      getDaysInMonth({ month: n2.getMonth(), year: n2.getFullYear() })
    )
  )

  return n2
}

export function adjacentDayKey(
  year: number,
  month: number,
  day: number,
  delta: number
): string {
  const shifted = day + delta
  if (shifted >= 1 && shifted <= getDaysInMonth({ month, year })) {
    return calendarDayKey(year, month, shifted)
  }
  const overflow = new Date(year, month, shifted)
  return calendarDateKey(overflow)
}

export function areDatesOnSameDay(a: Date, b?: Date | null | undefined) {
  if (!b) {
    return false
  }

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function calendarDateKey(date: Date): string {
  return calendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())
}

export function calendarDayKey(
  year: number,
  month: number,
  day: number
): string {
  return `${year}-${month}-${day}`
}

export function dateToUnix(d: Date): number {
  return Math.trunc(d.getTime() / 1000)
}

export function differenceInMonths(firstDate: Date, secondDate: Date) {
  let diffMonths = (secondDate.getFullYear() - firstDate.getFullYear()) * 12
  diffMonths -= firstDate.getMonth()
  diffMonths += secondDate.getMonth()
  return diffMonths
}

export function fieldOrder(inputFormat: string): Array<'D' | 'M' | 'Y'> {
  const yearIndex = Math.max(
    inputFormat.indexOf('YYYY'),
    inputFormat.indexOf('AAAA')
  )
  return (
    [
      { field: 'D' as const, index: inputFormat.indexOf('DD') },
      { field: 'M' as const, index: inputFormat.indexOf('MM') },
      { field: 'Y' as const, index: yearIndex },
    ] as const
  )
    .filter((entry) => entry.index >= 0)
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.field)
}

export function getBeginOffset(startYear?: number, endYear?: number): number {
  return estimatedMonthHeight * getStartAtIndex(startYear, endYear)
}

export function getDaysInMonth({
  month,
  year,
}: {
  month: number
  year: number
}): number {
  return [
    31,
    isLeapYear({ year }) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month]
}

export function getEndOfDay(d: Date): Date {
  const endOfDay = new Date(d)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay
}

export function getFirstDayOfMonth({
  month,
  startWeekOnMonday,
  year,
}: {
  month: number
  startWeekOnMonday: boolean
  year: number
}): number {
  let dayOfWeek = new Date(year, month, 1).getDay()
  if (startWeekOnMonday) {
    dayOfWeek = (dayOfWeek + 6) % 7
  }

  return dayOfWeek
}

export function getGridCount(
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) {
  const monthDate = addMonths(
    new Date(),
    getRealIndex(index, startYear, endYear)
  )
  return getGridCountForDate(monthDate, startWeekOnMonday)
}

export function getGridCountForDate(date: Date, startWeekOnMonday: boolean) {
  const month = date.getMonth()
  const year = date.getFullYear()
  const dayOfWeek = getFirstDayOfMonth({ month, startWeekOnMonday, year })
  const daysInMonth = getDaysInMonth({ month, year })
  return Math.ceil((daysInMonth + dayOfWeek) / 7)
}

export function getInitialIndex(
  date: Date | undefined,
  startYear?: number,
  endYear?: number
) {
  const dynamicStartAtIndex = getStartAtIndex(startYear, endYear)
  if (!date) {
    return dynamicStartAtIndex
  }

  const today = new Date()
  const months = differenceInMonths(today, date)

  return dynamicStartAtIndex + months
}

export function getRealIndex(
  index: number,
  startYear?: number,
  endYear?: number
) {
  return index - getStartAtIndex(startYear, endYear)
}

export function getStartAtIndex(startYear?: number, _endYear?: number): number {
  const start = startYear || defaultStartYear
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const key = `${start}:${currentYear}-${currentMonth}`
  const cached = startAtIndexCache.get(key)
  if (cached !== undefined) {
    return cached
  }

  const monthsFromStart = (currentYear - start) * 12 + currentMonth
  const value = Math.max(monthsFromStart, 0)
  startAtIndexCache.set(key, value)
  return value
}

export function getStartOfDay(d: Date): Date {
  const startOfDay = new Date(d)
  startOfDay.setHours(0, 0, 0, 0)
  return startOfDay
}

export function getTotalMonths(startYear?: number, endYear?: number): number {
  const end = endYear || defaultEndYear
  const start = startYear || defaultStartYear
  return (end - start + 1) * 12
}

export function interpretTypedDate(
  text: string,
  inputFormat: string,
  inputMode: 'end' | 'start',
  check: {
    isDisabled: (day: Date) => boolean
    isWithinValidRange: (day: Date) => boolean
  }
): { date?: Date; issue?: TypedDateIssue } {
  const trimmed = text.trim()
  if (!trimmed) return {}
  const parsed = parseLooseDate(trimmed, inputFormat)
  if (!parsed) return { issue: 'format' }
  const { day, month, year } = parsed
  const date =
    inputMode === 'end'
      ? new Date(year, month - 1, day, 23, 59, 59)
      : new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { issue: 'format' }
  }
  if (check.isDisabled(date)) return { issue: 'disabled' }
  if (!check.isWithinValidRange(date)) return { issue: 'range' }
  return { date }
}

export function isDateWithinOptionalRange(
  date: Date,
  {
    endUnix,
    startUnix,
  }: { endUnix: number | undefined; startUnix: number | undefined }
) {
  const dateUnix = dateToUnix(date)
  if (startUnix !== undefined && dateUnix < startUnix) {
    return false
  }

  if (endUnix !== undefined && dateUnix > endUnix) {
    return false
  }

  return true
}

export function isLeapYear({ year }: { year: number }) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function normalizeDigits(text: string) {
  return text.replace(/[٠-٩۰-۹]/g, (digit) => nativeDigits[digit])
}

export function parseLooseDate(
  text: string,
  inputFormat: string
): { day: number; month: number; year: number } | null {
  const order = fieldOrder(inputFormat)
  if (order.length !== 3) return null

  const trimmed = normalizeDigits(text.trim())
  if (!trimmed) return null

  const parts = trimmed.split(/[^\d]+/).filter((part) => part.length > 0)
  const values = { D: 0, M: 0, Y: 0 }

  if (parts.length === 1) {
    const digits = parts[0]
    if (digits.length < 6 || digits.length > 8) return null
    let offset = 0
    for (const field of order) {
      const size = field === 'Y' ? 4 : 2
      const chunk = digits.slice(offset, offset + size)
      if (chunk.length === 0) return null
      values[field] = Number(chunk)
      offset += chunk.length
    }
  } else if (parts.length === 3) {
    order.forEach((field, index) => {
      values[field] = Number(parts[index])
    })
  } else {
    return null
  }

  return { day: values.D, month: values.M, year: values.Y }
}

export function showWeekDay(
  dayIndex: number,
  disableWeekDays?: DisableWeekDaysType
): boolean {
  return !(disableWeekDays && disableWeekDays.some((di) => di === dayIndex))
}

export function useInputFormat({
  formatter,
  locale,
}: {
  formatter: Intl.DateTimeFormat
  locale: string | undefined
}) {
  return useMemo(() => {
    const inputDate = formatter.format(new Date(2020, 10 - 1, 1))

    if (inputDate.includes('٢٠٢٠')) {
      return inputDate
        .replace('٢٠٢٠', 'YYYY')
        .replace('١٠', 'MM')
        .replace('٠١', 'DD')
    }
    return inputDate
      .replace('2020', locale === 'pt' ? 'AAAA' : 'YYYY')
      .replace('10', 'MM')
      .replace('01', 'DD')
  }, [formatter, locale])
}

export function useInputFormatter({ locale }: { locale: string | undefined }) {
  return useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      calendar: 'gregory',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }, [locale])
}

export function useRangeChecker(validRange: ValidRangeType | undefined) {
  const disabledDates = validRange?.disabledDates

  const disabledKeys = useMemo(() => {
    const keys = new Set<string>()
    if (disabledDates) {
      for (const disabledDate of disabledDates) {
        keys.add(calendarDateKey(disabledDate))
      }
    }
    return keys
  }, [disabledDates])
  const isDisabled = useCallback(
    (day: Date) => disabledKeys.has(calendarDateKey(day)),
    [disabledKeys]
  )

  const validEnd = validRange?.endDate

  const endUnix =
    validEnd instanceof Date ? dateToUnix(getEndOfDay(validEnd)) : undefined

  const validStart = validRange?.startDate

  const startUnix =
    validStart instanceof Date
      ? dateToUnix(getStartOfDay(validStart))
      : undefined

  const isWithinValidRange = useCallback(
    (day: Date) => {
      return isDateWithinOptionalRange(day, {
        endUnix: endUnix,
        startUnix: startUnix,
      })
    },
    [startUnix, endUnix]
  )

  return { disabledKeys, isDisabled, isWithinValidRange, validEnd, validStart }
}
