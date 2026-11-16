import {
  adjacentDayKey,
  areDatesOnSameDay,
  calendarDateKey,
  dateToUnix,
  getEndOfDay,
  getStartOfDay,
} from './dateUtils'
import type { CalendarDate, CalendarDates, ModeType } from './types'

export type PressedDate = {
  change?: 'added' | 'removed'
  date?: CalendarDate
  datePressed?: Date
  dates?: Date[]
  endDate?: CalendarDate
  startDate?: CalendarDate
}

export function confirmDates(
  mode: ModeType,
  state: {
    date: CalendarDate
    dates: CalendarDates
    endDate: CalendarDate
    startDate: CalendarDate
  },
  rejectSameDay = false
): PressedDate | null {
  if (mode === 'single') {
    return { date: state.date }
  }
  if (mode === 'range') {
    if (
      rejectSameDay &&
      state.startDate &&
      state.endDate &&
      areDatesOnSameDay(state.startDate, state.endDate)
    ) {
      return null
    }
    return { endDate: state.endDate, startDate: state.startDate }
  }
  return { dates: state.dates || [] }
}

export type RangeBounds = {
  endUnix?: number
  sameDay: boolean
  startUnix?: number
}

export function rangeBounds(
  startDate: CalendarDate,
  endDate: CalendarDate
): RangeBounds {
  return {
    endUnix: endDate ? dateToUnix(getEndOfDay(endDate)) : undefined,
    sameDay: !!startDate && !!endDate && areDatesOnSameDay(startDate, endDate),
    startUnix: startDate ? dateToUnix(getStartOfDay(startDate)) : undefined,
  }
}

export function dayMarks({
  date,
  day,
  dayIndex,
  dayOfMonth,
  daysInMonth,
  endDate,
  mode,
  month,
  range,
  selectedKeys,
  startDate,
  year,
}: {
  date: CalendarDate
  day: Date
  dayIndex: number
  dayOfMonth: number
  daysInMonth: number
  endDate: CalendarDate
  mode: ModeType
  month: number
  range?: RangeBounds
  selectedKeys: Set<string>
  startDate: CalendarDate
  year: number
}) {
  let inRange = false
  let leftCrop = dayOfMonth === 1
  let rightCrop = dayOfMonth === daysInMonth
  let selected = false
  const isFirstDayOfMonth = dayOfMonth === 1
  const isLastDayOfMonth = dayOfMonth === daysInMonth

  if (mode === 'range') {
    const rangeEndUnix = range?.endUnix
    const rangeStartUnix = range?.startUnix
    const sameDayRange = range?.sameDay === true
    const selectedEndDay = areDatesOnSameDay(day, endDate)
    const selectedStartDay = areDatesOnSameDay(day, startDate)
    selected = selectedStartDay || selectedEndDay
    const dayUnix = dateToUnix(day)
    inRange =
      !sameDayRange &&
      rangeStartUnix !== undefined &&
      rangeEndUnix !== undefined &&
      dayUnix >= rangeStartUnix &&
      dayUnix <= rangeEndUnix
    if (selectedStartDay) {
      leftCrop = true
    }
    if (selectedEndDay) {
      rightCrop = true
    }
    if (dayIndex === 0 && !selectedStartDay) {
      leftCrop = false
    }
    if (dayIndex === 6 && !selectedEndDay) {
      rightCrop = false
    }
    if (
      (isFirstDayOfMonth && selectedEndDay) ||
      (isLastDayOfMonth && selectedStartDay)
    ) {
      inRange = false
    }
  } else if (mode === 'multiple') {
    const dayKey = calendarDateKey(day)
    selected = selectedKeys.has(dayKey)
    const tomorrowSelected = selectedKeys.has(
      adjacentDayKey(year, month, dayOfMonth, 1)
    )
    const yesterdaySelected = selectedKeys.has(
      adjacentDayKey(year, month, dayOfMonth, -1)
    )

    if (selected) {
      if (tomorrowSelected && yesterdaySelected) {
        inRange = true
      }
      if (tomorrowSelected && !yesterdaySelected) {
        inRange = true
        leftCrop = true
      }
      if (yesterdaySelected && !tomorrowSelected) {
        inRange = true
        rightCrop = true
      }
      if (isFirstDayOfMonth && !tomorrowSelected) {
        inRange = false
      }
      if (isLastDayOfMonth && !yesterdaySelected) {
        inRange = false
      }
      if (inRange && !leftCrop && !rightCrop) {
        selected = false
      }
    }
  } else {
    selected = areDatesOnSameDay(day, date)
  }

  return { inRange, leftCrop, rightCrop, selected }
}

export function pressDate(
  current: {
    dateMode?: 'end' | 'start'
    dates?: CalendarDates
    endDate?: CalendarDate
    mode: ModeType
    startDate?: CalendarDate
  },
  pressed: Date
): PressedDate {
  if (current.mode === 'single') {
    return {
      date: current.dateMode === 'start' ? pressed : getEndOfDay(pressed),
    }
  }
  if (current.mode === 'range') {
    const extendsRange =
      !!current.startDate &&
      (!current.endDate ||
        areDatesOnSameDay(current.startDate, current.endDate)) &&
      dateToUnix(getStartOfDay(pressed)) >
        dateToUnix(getStartOfDay(current.startDate))
    return {
      endDate: extendsRange ? getEndOfDay(pressed) : undefined,
      startDate: extendsRange ? current.startDate : pressed,
    }
  }

  const dates = current.dates || []
  const exists = dates.some((day) => areDatesOnSameDay(day, pressed))
  const nextDates = (
    exists
      ? dates.filter((day) => !areDatesOnSameDay(day, pressed))
      : [...dates, pressed]
  ).sort((left, right) => left.getTime() - right.getTime())
  return {
    change: exists ? 'removed' : 'added',
    datePressed: pressed,
    dates: nextDates,
  }
}
