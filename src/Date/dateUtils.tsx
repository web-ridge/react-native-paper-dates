export function dateToUnix(d: Date): number {
  return Math.round(d.getTime() / 1000)
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
export const gridCounts = allMonthsArray.fill(null).map((_, index) => {
  const monthDate = addMonths(new Date(), getRealIndex(index))
  return getGridCountForDate(monthDate)
})

export function getGridCountForDate(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const daysInMonth = getDaysInMonth({ year, month })
  const dayOfWeek = getFirstDayOfMonth({ year, month })
  return Math.ceil((daysInMonth + dayOfWeek) / 7)
}

export function getRealIndex(index: number) {
  return index - startAtIndex
}
