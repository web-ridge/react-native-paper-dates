import * as React from 'react'

export function dateToUnix(d: Date): number {
  return Math.round(d.getTime() / 1000)
}

// https://stackoverflow.com/questions/2706125/javascript-function-to-add-x-months-to-a-date/2706169
export function addMonths(date: Date, count: number) {
  if (date && count) {
    let m,
      d = (date = new Date(+date)).getUTCDate()

    date.setUTCMonth(date.getUTCMonth() + count, 1)
    m = date.getUTCMonth()
    date.setUTCDate(d)
    if (date.getUTCMonth() !== m) date.setUTCDate(0)
  }
  return date
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
}: {
  year: number
  month: number
}): number {
  return new Date(year, month, 1).getDay()
}

export function getLastDayOfMonth({
  year,
  month,
}: {
  year: number
  month: number
}): number {
  return new Date(year, month, getDaysInMonth({ year, month })).getDay()
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
  if (date <= endDate && date >= startDate) {
    return true
  }
  return false
}

export function isLeapYear({ year }: { year: number }) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export const daySize = 46

export const startAtIndex = 1000
export const totalMonths = startAtIndex * 2
export const allMonthsArray = new Array(totalMonths)
export const gridCounts = allMonthsArray.fill(undefined).map((_, index) => {
  const monthDate = addMonths(new Date(), index)
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const daysInMonth = getDaysInMonth({ year, month })
  const dayOfWeek = getFirstDayOfMonth({ year, month })
  return Math.ceil((daysInMonth + dayOfWeek) / 7)
})

export function getRealIndex(index: number) {
  return index - startAtIndex
}
