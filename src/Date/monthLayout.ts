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
} from './dateUtils'
import { dayNamesHeight } from './DayNames'
import { getMaxIndex, getMinIndex } from './SwiperUtils'

type VerticalLayout = {
  gridCount: number[]
  startAtIndex: number
  weekPrefix: number[]
}

const maxWeekRows = 6
const verticalLayoutCache = new Map<string, VerticalLayout>()

export const monthHeaderHeight = 56
export const monthHeaderSingleMarginBottom = 8 + dayNamesHeight
export const monthHeaderSingleMarginTop = 4
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

function getVerticalLayout(
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): VerticalLayout {
  const end = endYear ?? defaultEndYear
  const start = startYear ?? defaultStartYear
  const key = `${start}:${end}:${startWeekOnMonday ? 1 : 0}:${currentCalendarMonth().stamp}`
  const cached = verticalLayoutCache.get(key)
  if (cached) {
    return cached
  }

  const startAtIndex = getStartAtIndex(start, end)
  const total = getTotalMonths(start, end)
  const gridCount = new Array<number>(total)
  const weekPrefix = new Array<number>(total + 1)
  weekPrefix[0] = 0
  for (let i = 0; i < total; i += 1) {
    const count = getGridCount(i, startWeekOnMonday, start, end)
    gridCount[i] = count
    weekPrefix[i + 1] = weekPrefix[i] + count
  }
  const layout = { gridCount, startAtIndex, weekPrefix }
  verticalLayoutCache.set(key, layout)
  return layout
}

function weeksOffset(
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): number {
  const layout = getVerticalLayout(startWeekOnMonday, startYear, endYear)
  const max = layout.weekPrefix.length - 1
  const clamped = Math.max(0, Math.min(index, max))
  return layout.weekPrefix[clamped] - layout.weekPrefix[layout.startAtIndex]
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
  const layout = getVerticalLayout(startWeekOnMonday, startYear, endYear)
  const gc =
    layout.gridCount[index] ??
    getGridCount(index, startWeekOnMonday, startYear, endYear)
  const currentMonthHeight = weekSize * gc
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
  const layout = getVerticalLayout(startWeekOnMonday, startYear, endYear)
  const weeks =
    layout.gridCount[index] ??
    getGridCount(index, startWeekOnMonday, startYear, endYear)
  return weekSize * weeks > viewportHeight - horizontalMonthChrome
}

export function horizontalWeekHeight(daysHeight: number) {
  if (daysHeight <= 0) return dayCellSize
  return Math.min(dayCellSize, daysHeight / maxWeekRows)
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
  const layout = getVerticalLayout(startWeekOnMonday, startYear, endYear)
  return (
    layout.gridCount[index] ??
    getGridCount(index, startWeekOnMonday, startYear, endYear)
  )
}
