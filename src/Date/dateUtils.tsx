import { useCallback, useMemo } from 'react'
import { useLatest } from '../shared/utils'
import type { ValidRangeType } from './Calendar'

export type DisableWeekDaysType = number[]

export function showWeekDay(
  dayIndex: number,
  disableWeekDays?: DisableWeekDaysType
): boolean {
  return !(disableWeekDays && disableWeekDays.some((di) => di === dayIndex))
}

export function dateToUnix(d: Date): number {
  return Math.trunc(d.getTime() / 1000)
}

export function addMonths(date: Date, count: number) {
  let n = date.getDate()
  let n2 = new Date(date.getTime())
  n2.setDate(1)
  n2.setMonth(n2.getMonth() + count)
  n2.setDate(
    Math.min(
      n,
      getDaysInMonth({ year: n2.getFullYear(), month: n2.getMonth() })
    )
  )

  return n2
}

// https://stackoverflow.com/a/1185068/2508481
// pass in any date as parameter anyDateInMonth based on dayjs
export function getDaysInMonth({
  year,
  month,
}: {
  year: number
  month: number
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

export function getFirstDayOfMonth({
  year,
  month,
  startWeekOnMonday,
}: {
  year: number
  month: number
  startWeekOnMonday: boolean
}): number {
  let dayOfWeek = new Date(year, month, 1).getDay()
  if (startWeekOnMonday) {
    // Map Sunday (0) to 6, Monday (1) to 0, etc.
    dayOfWeek = (dayOfWeek + 6) % 7
  }

  return dayOfWeek
}

export function useRangeChecker(validRange: ValidRangeType | undefined) {
  const validStart = validRange?.startDate
  const validEnd = validRange?.endDate
  const startUnix =
    validStart instanceof Date
      ? dateToUnix(getStartOfDay(validStart))
      : undefined

  const endUnix =
    validEnd instanceof Date ? dateToUnix(getEndOfDay(validEnd)) : undefined

  const validDisabledDatesRef = useLatest(validRange?.disabledDates)

  const isWithinValidRange = useCallback(
    (day: Date) => {
      return isDateWithinOptionalRange(day, {
        startUnix: startUnix,
        endUnix: endUnix,
      })
    },
    [startUnix, endUnix]
  )

  const isDisabled = useCallback(
    (day: Date) => {
      return validDisabledDatesRef.current
        ? validDisabledDatesRef.current.some((disabledDate) =>
            areDatesOnSameDay(disabledDate, day)
          )
        : false
    },
    [validDisabledDatesRef]
  )

  return { isDisabled, isWithinValidRange, validStart, validEnd }
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

export function isDateBetween(
  date: Date,
  {
    startDate,
    endDate,
  }: {
    startDate?: Date | null | undefined
    endDate?: Date | null | undefined
  }
): boolean {
  if (!startDate || !endDate) {
    return false
  }
  return date <= endDate && date >= startDate
}

/**
 * Check if a date is within an optional range.
 *
 * If the range doesn't exist, it defaults to `true`.
 */
export function isDateWithinOptionalRange(
  date: Date,
  {
    startUnix,
    endUnix,
  }: { startUnix: number | undefined; endUnix: number | undefined }
) {
  const dateUnix = dateToUnix(date)
  // if startUnix is provided and date is before start
  if (startUnix && dateUnix < startUnix) {
    return false
  }

  // if endUnix is provided and date is after end
  if (endUnix && dateUnix > endUnix) {
    return false
  }

  return true
}

export function isLeapYear({ year }: { year: number }) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export const daySize = 46
export const estimatedMonthHeight = 360
export const defaultStartYear = 1800
export const defaultEndYear = 2200

// Dynamic calculation functions to replace fixed constants
export function getStartAtIndex(startYear?: number, _endYear?: number): number {
  const start = startYear || 1800
  const today = new Date()
  const currentYear = today.getFullYear()

  // Calculate months from start year to current year
  const monthsFromStart = (currentYear - start) * 12 + today.getMonth()

  // Ensure we have enough buffer for the range
  return Math.max(monthsFromStart, 0)
}

export function getTotalMonths(startYear?: number, endYear?: number): number {
  const start = startYear || 1800
  const end = endYear || 2200
  return (end - start + 1) * 12
}

export function getBeginOffset(startYear?: number, endYear?: number): number {
  return estimatedMonthHeight * getStartAtIndex(startYear, endYear)
}

// Keep the old constants for backward compatibility but make them dynamic
export const startAtIndex = 2800
export const totalMonths = startAtIndex * 2
export const beginOffset = estimatedMonthHeight * startAtIndex

// Create a dynamic grid counts array
export function createGridCounts(count: number): Array<number | undefined> {
  return new Array<number | undefined>(count)
}

export const gridCounts = new Array<number | undefined>(totalMonths)

export function getGridCount(
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) {
  const dynamicGridCounts = createGridCounts(getTotalMonths(startYear, endYear))
  const cHeight = dynamicGridCounts[index]
  if (cHeight) {
    return cHeight
  }
  const monthDate = addMonths(
    new Date(),
    getRealIndex(index, startYear, endYear)
  )
  const h = getGridCountForDate(monthDate, startWeekOnMonday)
  dynamicGridCounts[index] = h
  return h
}

export function getGridCountForDate(date: Date, startWeekOnMonday: boolean) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const daysInMonth = getDaysInMonth({ year, month })
  const dayOfWeek = getFirstDayOfMonth({ year, month, startWeekOnMonday })
  return Math.ceil((daysInMonth + dayOfWeek) / 7)
}

export function getRealIndex(
  index: number,
  startYear?: number,
  endYear?: number
) {
  return index - getStartAtIndex(startYear, endYear)
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

export function useInputFormatter({ locale }: { locale: string | undefined }) {
  return useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
  }, [locale])
}

export function getStartOfDay(d: Date): Date {
  const startOfDay = new Date(d)
  startOfDay.setUTCHours(0, 0, 0, 0)
  return startOfDay
}

export function getEndOfDay(d: Date): Date {
  const endOfDay = new Date(d)
  endOfDay.setUTCHours(23, 59, 59, 999)
  return endOfDay
}

export function useInputFormat({
  formatter,
  locale,
}: {
  formatter: Intl.DateTimeFormat
  locale: string | undefined
}) {
  return useMemo(() => {
    // TODO: something cleaner and more universal?
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

export function differenceInMonths(firstDate: Date, secondDate: Date) {
  let diffMonths = (secondDate.getFullYear() - firstDate.getFullYear()) * 12
  diffMonths -= firstDate.getMonth()
  diffMonths += secondDate.getMonth()
  return diffMonths
}
