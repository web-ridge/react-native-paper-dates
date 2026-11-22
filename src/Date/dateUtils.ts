import type { DisableWeekDaysType } from './types'

type TypedDateIssue = 'disabled' | 'format' | 'range'

const calendarDay = {
  day: 0,
  expiresAt: 0,
  month: 0,
  year: 0,
}

const calendarMonth = {
  expiresAt: 0,
  month: 0,
  stamp: '',
  year: 0,
}

export const dateInputMaxHeight = 512
export const datePickerRangeMaxHeight = 568
export const datePickerSingleMaxHeight = 524
export const dayCellSize = 48
export const daySize = 40
export const defaultEndYear = 2200
export const defaultStartYear = 1800
export const estimatedMonthHeight = 400
const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const nativeDigits: Record<string, string> = {}
const startAtIndexCache = new Map<string, number>()

export type { DisableWeekDaysType }

for (const [index, digit] of '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹'.split('').entries()) {
  nativeDigits[digit] = String(index % 10)
}

const weekdayOffsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4]

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
  const overflow = resolveCalendarDay(year, month, shifted)
  return calendarDayKey(overflow.year, overflow.month, overflow.day)
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

export function calendarOrdinal(year: number, month: number, day: number) {
  return year * 372 + month * 31 + day
}

export function currentCalendarDay() {
  const now = Date.now()
  if (now < calendarDay.expiresAt) {
    return calendarDay
  }

  const today = new Date(now)
  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()
  calendarDay.day = day
  calendarDay.expiresAt = new Date(year, month, day + 1).getTime()
  calendarDay.month = month
  calendarDay.year = year
  return calendarDay
}

export function currentCalendarMonth() {
  const now = Date.now()
  if (now < calendarMonth.expiresAt) {
    return calendarMonth
  }

  const today = new Date(now)
  const month = today.getMonth()
  const year = today.getFullYear()
  calendarMonth.expiresAt = new Date(year, month + 1, 1).getTime()
  calendarMonth.month = month
  calendarMonth.stamp = `${year}-${month}`
  calendarMonth.year = year
  return calendarMonth
}

export function dateOrdinal(date: Date) {
  return calendarOrdinal(date.getFullYear(), date.getMonth(), date.getDate())
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

function fieldOrder(inputFormat: string): Array<'D' | 'M' | 'Y'> {
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
  if (month === 1 && isLeapYear({ year })) return 29
  return monthLengths[month]
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
  let dayOfWeek = gregorianWeekday(year, month, 1)
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
  const { month, year } = monthFromIndex(index, startYear, endYear)
  return monthWeekRows(year, month, startWeekOnMonday)
}

export function getGridCountForDate(date: Date, startWeekOnMonday: boolean) {
  return monthWeekRows(date.getFullYear(), date.getMonth(), startWeekOnMonday)
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
  const { month, stamp, year } = currentCalendarMonth()
  const key = `${start}:${stamp}`
  const cached = startAtIndexCache.get(key)
  if (cached !== undefined) {
    return cached
  }

  const monthsFromStart = (year - start) * 12 + month
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

export function gregorianWeekday(
  year: number,
  month: number,
  day: number
): number {
  let weekdayYear = year
  if (month < 2) weekdayYear -= 1
  const weekday =
    (weekdayYear +
      Math.floor(weekdayYear / 4) -
      Math.floor(weekdayYear / 100) +
      Math.floor(weekdayYear / 400) +
      weekdayOffsets[month] +
      day) %
    7
  return weekday < 0 ? weekday + 7 : weekday
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
  { endUnix, startUnix }: { endUnix?: number; startUnix?: number }
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

export function monthFromIndex(
  index: number,
  startYear?: number,
  endYear?: number
): { month: number; year: number } {
  const { month, year } = currentCalendarMonth()
  const absolute =
    year * 12 + month + (index - getStartAtIndex(startYear, endYear))
  let nextYear = Math.floor(absolute / 12)
  let nextMonth = absolute - nextYear * 12
  if (nextMonth < 0) {
    nextMonth += 12
    nextYear -= 1
  }
  return { month: nextMonth, year: nextYear }
}

export function monthWeekRows(
  year: number,
  month: number,
  startWeekOnMonday: boolean
): number {
  const dayOfWeek = getFirstDayOfMonth({ month, startWeekOnMonday, year })
  return Math.ceil((getDaysInMonth({ month, year }) + dayOfWeek) / 7)
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

export function resolveCalendarDay(year: number, month: number, day: number) {
  let resolvedDay = day
  let resolvedMonth = month
  let resolvedYear = year
  while (resolvedDay < 1) {
    resolvedMonth -= 1
    if (resolvedMonth < 0) {
      resolvedMonth = 11
      resolvedYear -= 1
    }
    resolvedDay += getDaysInMonth({
      month: resolvedMonth,
      year: resolvedYear,
    })
  }
  let daysInMonth = getDaysInMonth({
    month: resolvedMonth,
    year: resolvedYear,
  })
  while (resolvedDay > daysInMonth) {
    resolvedDay -= daysInMonth
    resolvedMonth += 1
    if (resolvedMonth > 11) {
      resolvedMonth = 0
      resolvedYear += 1
    }
    daysInMonth = getDaysInMonth({
      month: resolvedMonth,
      year: resolvedYear,
    })
  }
  return { day: resolvedDay, month: resolvedMonth, year: resolvedYear }
}

export function shiftMonth(year: number, month: number, count: number) {
  const absolute = year * 12 + month + count
  let nextYear = Math.floor(absolute / 12)
  let nextMonth = absolute - nextYear * 12
  if (nextMonth < 0) {
    nextMonth += 12
    nextYear -= 1
  }
  return { month: nextMonth, year: nextYear }
}

export function showWeekDay(
  dayIndex: number,
  disableWeekDays?: DisableWeekDaysType
): boolean {
  return !(disableWeekDays && disableWeekDays.some((di) => di === dayIndex))
}
