import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import Swiper from './Swiper'
import Month from './Month'
import {
  areDatesOnSameDay,
  dateToUnix,
  DisableWeekDaysType,
  getEndOfDay,
  getInitialIndex,
} from './dateUtils'

import CalendarHeader from './CalendarHeader'
import { memo, useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import YearPicker from './YearPicker'
import { useTheme } from 'react-native-paper'
import { useLatest } from '../shared/utils'
import { sharedStyles } from '../shared/styles'
import { defaultStartYear, defaultEndYear } from './dateUtils'

export type ModeType = 'single' | 'range' | 'multiple'

export type ScrollModeType = 'horizontal' | 'vertical'

export type ValidRangeType = {
  startDate?: Date
  endDate?: Date
  disabledDates?: Date[]
}

/**
 * Where `dayContent` is anchored within a day. The anchor box matches the day
 * circle (not the wider grid cell), so corner positions sit on the circle's
 * bounding box.
 */
export type DayContentPosition =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'center'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'

/**
 * Renders custom content inside a day, e.g. a dot or a badge with the number
 * of events on that date. The node is overlaid on the day and does not receive
 * touches, so pressing it still selects the date. Use `dayContentPosition` and
 * `dayContentStyle` to place it.
 */
export type DayContentRenderer = (params: {
  date: Date
  day: number
  month: number
  year: number
  selected: boolean
  isToday: boolean
  disabled: boolean
}) => ReactNode

export type BaseCalendarProps = {
  locale: string
  disableWeekDays?: DisableWeekDaysType
  validRange?: ValidRangeType
  startYear?: number
  endYear?: number
  startWeekOnMonday?: boolean
  // here they are optional but in final implementation they are required
  date?: CalendarDate
  dates?: CalendarDates
  startDate?: CalendarDate
  endDate?: CalendarDate
  dateMode?: 'start' | 'end'
  dayContent?: DayContentRenderer
  /** Anchor for `dayContent`. Defaults to `'bottom'`. */
  dayContentPosition?: DayContentPosition
  /** Style for the `dayContent` overlay container (offsets, size, …). */
  dayContentStyle?: StyleProp<ViewStyle>
}

export type CalendarDate = Date | undefined
export type CalendarDates = Date[] | undefined | null

export type RangeChange = (params: {
  startDate: CalendarDate
  endDate: CalendarDate
}) => any

export type SingleChange = (params: { date: CalendarDate }) => void

export type MultiChange = (params: {
  dates: CalendarDates
  datePressed: Date
  change: 'added' | 'removed'
}) => any

export type MultiConfirm = (params: { dates: Date[] }) => void

export interface CalendarSingleProps extends BaseCalendarProps {
  mode: 'single'
  date: CalendarDate
  onChange: SingleChange
}

export interface CalendarRangeProps extends BaseCalendarProps {
  mode: 'range'
  startDate: CalendarDate
  endDate: CalendarDate
  onChange: RangeChange
}

export interface CalendarMultiProps extends BaseCalendarProps {
  mode: 'multiple'
  dates: CalendarDates
  onChange: MultiChange
}

function Calendar(
  props: CalendarSingleProps | CalendarRangeProps | CalendarMultiProps
) {
  const {
    locale,
    mode,
    onChange,
    startDate,
    endDate,
    date,
    disableWeekDays,
    startYear,
    endYear,
    dates,
    validRange,
    dateMode,
    startWeekOnMonday,
    dayContent,
    dayContentPosition,
    dayContentStyle,
  } = props
  const scrollMode =
    mode === 'range' || mode === 'multiple' ? 'vertical' : 'horizontal'
  const firstDate = startDate || date || dates?.[0]

  const theme = useTheme()

  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  )
  const [selectingYear, setSelectingYear] = useState(false)

  // prevent re-rendering all months when something changed we only need the
  // latest version of the props and we don't want the useCallback to change
  const startDateRef = useLatest<CalendarDate>(startDate)
  const endDateRef = useLatest<CalendarDate>(endDate)
  const onChangeRef = useLatest<RangeChange | SingleChange | MultiChange>(
    onChange
  )
  const datesRef = useLatest<CalendarDates>(dates)

  const onPressYear = useCallback(
    (year: number) => {
      setSelectedYear(year)
      setSelectingYear((prev) => !prev)
    },
    [setSelectingYear]
  )

  const onPressDate = useCallback(
    (d: Date) => {
      if (mode === 'single') {
        ;(onChangeRef.current as SingleChange)({
          date: dateMode === 'start' ? d : getEndOfDay(d),
        })
      } else if (mode === 'range') {
        const sd = startDateRef.current
        const ed = endDateRef.current
        let isStart: boolean = true
        if (sd && !ed && dateToUnix(d) >= dateToUnix(sd!)) {
          isStart = false
        }
        ;(onChangeRef.current as RangeChange)({
          startDate: isStart ? d : sd,
          endDate: !isStart ? getEndOfDay(d) : undefined,
        })
      } else if (mode === 'multiple') {
        datesRef.current = datesRef.current || []
        const exists = datesRef.current.some((ed) => areDatesOnSameDay(ed, d))

        const newDates = exists
          ? datesRef.current.filter((ed) => !areDatesOnSameDay(ed, d))
          : [...datesRef.current, d]

        newDates.sort((a, b) => a.getTime() - b.getTime())
        ;(onChangeRef.current as MultiChange)({
          dates: newDates,
          datePressed: d,
          change: exists ? 'removed' : 'added',
        })
      }
    },
    [mode, dateMode, onChangeRef, startDateRef, endDateRef, datesRef]
  )

  const selectColor = theme.colors.primaryContainer

  return (
    <View style={sharedStyles.root}>
      <Swiper
        initialIndex={getInitialIndex(firstDate, startYear, endYear)}
        selectedYear={selectedYear}
        scrollMode={scrollMode}
        startWeekOnMonday={startWeekOnMonday || false}
        startYear={startYear}
        endYear={endYear}
        renderItem={({ index }) => (
          <Month
            locale={locale}
            mode={mode}
            key={index}
            validRange={validRange}
            index={index}
            startDate={startDate}
            endDate={endDate}
            date={date}
            dates={dates}
            onPressYear={onPressYear}
            selectingYear={selectingYear}
            onPressDate={onPressDate}
            scrollMode={scrollMode}
            primaryColor={theme.colors.primary}
            selectColor={selectColor}
            roundness={theme.roundness}
            disableWeekDays={disableWeekDays}
            startWeekOnMonday={startWeekOnMonday || false}
            startYear={startYear}
            endYear={endYear}
            dayContent={dayContent}
            dayContentPosition={dayContentPosition}
            dayContentStyle={dayContentStyle}
          />
        )}
        renderHeader={({ onPrev, onNext }) => (
          <CalendarHeader
            locale={locale}
            onPrev={onPrev}
            onNext={onNext}
            scrollMode={scrollMode}
            disableWeekDays={disableWeekDays}
            startWeekOnMonday={startWeekOnMonday || false}
          />
        )}
      />
      {scrollMode === 'horizontal' ? (
        <YearPicker
          selectedYear={selectedYear}
          selectingYear={selectingYear}
          onPressYear={onPressYear}
          startYear={startYear || defaultStartYear}
          endYear={endYear || defaultEndYear}
        />
      ) : null}
    </View>
  )
}

export default memo(Calendar)
