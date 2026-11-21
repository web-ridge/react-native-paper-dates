import {
  adjacentDayKey,
  areDatesOnSameDay,
  calendarDayKey,
  calendarOrdinal,
  dateOrdinal,
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
export type RangeBounds = {
  endOrdinal?: number
  sameDay: boolean
  startOrdinal?: number
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

export function dayMarks({
  cellDay,
  cellMonth,
  cellYear,
  date,
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
  cellDay: number
  cellMonth: number
  cellYear: number
  date: CalendarDate
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
    const rangeEnd = range?.endOrdinal
    const rangeStart = range?.startOrdinal
    const sameDayRange = range?.sameDay === true
    const selectedEndDay = sameCalendarDay(
      cellYear,
      cellMonth,
      cellDay,
      endDate
    )
    const selectedStartDay = sameCalendarDay(
      cellYear,
      cellMonth,
      cellDay,
      startDate
    )
    selected = selectedStartDay || selectedEndDay
    const dayOrdinal = calendarOrdinal(cellYear, cellMonth, cellDay)
    inRange =
      !sameDayRange &&
      rangeStart !== undefined &&
      rangeEnd !== undefined &&
      dayOrdinal >= rangeStart &&
      dayOrdinal <= rangeEnd
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
    const dayKey = calendarDayKey(cellYear, cellMonth, cellDay)
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
    selected = sameCalendarDay(cellYear, cellMonth, cellDay, date)
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
  // Hermes in RN 0.81–0.83 (legacy) has no Array.prototype.toSorted.
  const nextDates = (
    exists
      ? dates.filter((day) => !areDatesOnSameDay(day, pressed))
      : [...dates, pressed]
  )
    .slice()
    .sort((left, right) => left.getTime() - right.getTime())
  return {
    change: exists ? 'removed' : 'added',
    datePressed: pressed,
    dates: nextDates,
  }
}

function sameCalendarDay(
  year: number,
  month: number,
  day: number,
  date: CalendarDate
) {
  return (
    !!date &&
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  )
}

export function rangeBounds(
  startDate: CalendarDate,
  endDate: CalendarDate
): RangeBounds {
  return {
    endOrdinal: endDate ? dateOrdinal(endDate) : undefined,
    sameDay: !!startDate && !!endDate && areDatesOnSameDay(startDate, endDate),
    startOrdinal: startDate ? dateOrdinal(startDate) : undefined,
  }
}
