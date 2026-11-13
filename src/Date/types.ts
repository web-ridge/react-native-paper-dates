import type { ReactNode } from 'react'

export type CalendarDate = Date | undefined
export type CalendarDates = Date[] | undefined | null

export type DayContentPosition =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'center'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'

export type DayContentRenderer = (params: {
  date: Date
  day: number
  disabled: boolean
  isToday: boolean
  month: number
  selected: boolean
  year: number
}) => ReactNode

export type DisableWeekDaysType = number[]

export type ModeType = 'single' | 'range' | 'multiple'

export type MultiChange = (params: {
  change: 'added' | 'removed'
  datePressed: Date
  dates: CalendarDates
}) => any

export type MultiConfirm = (params: { dates: Date[] }) => void

export type RangeChange = (params: {
  endDate: CalendarDate
  startDate: CalendarDate
}) => any

export type ScrollModeType = 'horizontal' | 'vertical'

export type SingleChange = (params: { date: CalendarDate }) => void

export type ValidRangeType = {
  disabledDates?: Date[]
  endDate?: Date
  startDate?: Date
}
