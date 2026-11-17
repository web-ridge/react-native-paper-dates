import { getCalendarHeaderHeight } from './CalendarHeader'
import {
  currentCalendarMonth,
  dayCellSize,
  defaultEndYear,
  defaultStartYear,
  estimatedMonthHeight,
  getBeginOffset,
  getGridCount,
  getStartAtIndex,
  getTotalMonths,
  monthFromIndex,
  monthWeekRows,
} from './dateUtils'
import { dayNamesHeight } from './DayNames'
import { getMaxIndex, getMinIndex } from './SwiperUtils'

type MonthWeeks = {
  prefix: number[]
  rows: number[]
  startAtIndex: number
  total: number
}

const weekPrefixCache = new Map<string, MonthWeeks>()

export const monthHeaderHeight = 56
export const monthHeaderSingleMarginBottom = dayNamesHeight
export const monthHeaderSingleMarginTop = 0
export const monthHeaderSingleHeight =
  monthHeaderSingleMarginTop + monthHeaderSingleMarginBottom
export const weekMargin = 0
export const weekSize = dayCellSize + weekMargin

const horizontalMonthChrome =
  monthHeaderSingleMarginTop + monthHeaderHeight + monthHeaderSingleMarginBottom

function getIndexCount(
  index: number,
  startYear?: number,
  endYear?: number
): number {
  const dynamicStartAtIndex = getStartAtIndex(startYear, endYear)
  if (index > dynamicStartAtIndex) {
    return index - dynamicStartAtIndex
  }

  return -(dynamicStartAtIndex - index)
}

function getWeekPrefix(
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): MonthWeeks {
  const end = endYear ?? defaultEndYear
  const start = startYear ?? defaultStartYear
  const { stamp } = currentCalendarMonth()
  const key = `${start}:${end}:${startWeekOnMonday ? 1 : 0}:${stamp}`
  const cached = weekPrefixCache.get(key)
  if (cached) return cached

  const total = getTotalMonths(start, end)
  const startAtIndex = getStartAtIndex(start, end)
  const span = Math.max(total, startAtIndex)
  const rows = new Array<number>(span)
  const prefix = new Array<number>(span + 1)
  prefix[0] = 0
  let { month, year } = monthFromIndex(0, start, end)
  let sum = 0
  for (let index = 0; index < span; index += 1) {
    const count = monthWeekRows(year, month, startWeekOnMonday)
    rows[index] = count
    sum += count
    prefix[index + 1] = sum
    month += 1
    if (month === 12) {
      month = 0
      year += 1
    }
  }
  const layout = { prefix, rows, startAtIndex, total }
  weekPrefixCache.set(key, layout)
  return layout
}

function weekRows(
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): number {
  const layout = getWeekPrefix(startWeekOnMonday, startYear, endYear)
  return (
    layout.rows[index] ??
    getGridCount(index, startWeekOnMonday, startYear, endYear)
  )
}

function weeksOffset(
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): number {
  const layout = getWeekPrefix(startWeekOnMonday, startYear, endYear)
  const clamped = Math.max(0, Math.min(index, layout.total))
  return layout.prefix[clamped] - layout.prefix[layout.startAtIndex]
}

export function getIndexFromVerticalOffset(
  offset: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): number {
  const target =
    offset + estimatedMonthHeight * getStartAtIndex(startYear, endYear)
  let low = getMinIndex(startYear, endYear)
  let high = getMaxIndex(startYear, endYear)
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    const top = getVerticalMonthsOffset(
      mid,
      startWeekOnMonday,
      startYear,
      endYear
    )
    if (top > target) {
      high = mid - 1
    } else {
      low = mid
    }
  }
  return low
}

export function getMonthHeight(
  scrollMode: 'horizontal' | 'vertical',
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): number {
  const calendarHeight = getCalendarHeaderHeight(scrollMode)
  const extraHeight =
    scrollMode === 'horizontal' ? monthHeaderSingleHeight : monthHeaderHeight
  const currentMonthHeight =
    weekSize * weekRows(index, startWeekOnMonday, startYear, endYear)
  return calendarHeight + currentMonthHeight + extraHeight
}

export function getVerticalListMetrics(
  minIndex: number,
  maxIndex: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) {
  const end =
    getVerticalMonthsOffset(maxIndex, startWeekOnMonday, startYear, endYear) +
    getMonthHeight('vertical', maxIndex, startWeekOnMonday, startYear, endYear)
  const origin = getVerticalMonthsOffset(
    minIndex,
    startWeekOnMonday,
    startYear,
    endYear
  )
  return {
    height: Math.max(end - origin, 1),
    origin,
  }
}

export function getVerticalMonthScrollY(
  index: number,
  origin: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) {
  return Math.max(
    0,
    getVerticalMonthsOffset(index, startWeekOnMonday, startYear, endYear) -
      origin -
      monthHeaderHeight
  )
}

export function getVerticalMonthsOffset(
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) {
  const count = getIndexCount(index, startYear, endYear)
  const dynamicBeginOffset =
    estimatedMonthHeight * getStartAtIndex(startYear, endYear)
  const ob = weeksOffset(index, startWeekOnMonday, startYear, endYear)
  const monthsHeight = weekSize * ob
  const c = monthsHeight + count * (dayNamesHeight + monthHeaderHeight)

  return c + dynamicBeginOffset
}

export function horizontalMonthScrolls(
  viewportHeight: number,
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): boolean {
  const weeks = weekRows(index, startWeekOnMonday, startYear, endYear)
  return weekSize * weeks > viewportHeight - horizontalMonthChrome
}

export function horizontalContentHeight(
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) {
  return (
    horizontalMonthChrome +
    weekSize * monthWeekCount(index, startWeekOnMonday, startYear, endYear)
  )
}

export function horizontalWeekHeight(daysHeight: number, weekCount: number) {
  const weeks = Math.max(weekCount, 1)
  if (daysHeight <= 0) return dayCellSize
  return Math.min(dayCellSize, daysHeight / weeks)
}

export function indexFromVerticalScroll(
  scrollOffset: number,
  origin: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) {
  return getIndexFromVerticalOffset(
    origin + scrollOffset - getBeginOffset(startYear, endYear),
    startWeekOnMonday,
    startYear,
    endYear
  )
}

export function monthWeekCount(
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) {
  return weekRows(index, startWeekOnMonday, startYear, endYear)
}
