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
import { themeColor, useLatest } from '../shared/utils'
import { sharedStyles } from '../shared/styles'
import { defaultStartYear, defaultEndYear } from './dateUtils'

export type ModeType = 'single' | 'range' | 'multiple'

export type ScrollModeType = 'horizontal' | 'vertical'

export type ValidRangeType = {
  disabledDates?: Date[]
  endDate?: Date
  startDate?: Date
}

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

export type BaseCalendarProps = {
  date?: CalendarDate
  dateMode?: 'start' | 'end'
  dates?: CalendarDates
  dayContent?: DayContentRenderer
  dayContentPosition?: DayContentPosition
  dayContentStyle?: StyleProp<ViewStyle>
  disableWeekDays?: DisableWeekDaysType
  endDate?: CalendarDate
  endYear?: number
  initialLayout?: { width: number; height: number }
  locale: string
  startDate?: CalendarDate
  startWeekOnMonday?: boolean
  startYear?: number
  validRange?: ValidRangeType
}

export type CalendarDate = Date | undefined
export type CalendarDates = Date[] | undefined | null

export type RangeChange = (params: {
  endDate: CalendarDate
  startDate: CalendarDate
}) => any

export type SingleChange = (params: { date: CalendarDate }) => void

export type MultiChange = (params: {
  change: 'added' | 'removed'
  datePressed: Date
  dates: CalendarDates
}) => any

export type MultiConfirm = (params: { dates: Date[] }) => void

export interface CalendarSingleProps extends BaseCalendarProps {
  date: CalendarDate
  mode: 'single'
  onChange: SingleChange
}

export interface CalendarRangeProps extends BaseCalendarProps {
  endDate: CalendarDate
  mode: 'range'
  onChange: RangeChange
  startDate: CalendarDate
}

export interface CalendarMultiProps extends BaseCalendarProps {
  dates: CalendarDates
  mode: 'multiple'
  onChange: MultiChange
}

function Calendar(
  props: CalendarSingleProps | CalendarRangeProps | CalendarMultiProps
) {
  const {
    date,
    dateMode,
    dates,
    dayContent,
    dayContentPosition,
    dayContentStyle,
    disableWeekDays,
    endDate,
    endYear,
    initialLayout,
    locale,
    mode,
    onChange,
    startDate,
    startWeekOnMonday,
    startYear,
    validRange,
  } = props
  const scrollMode =
    mode === 'range' || mode === 'multiple' ? 'vertical' : 'horizontal'
  const firstDate = startDate || date || dates?.[0]

  const theme = useTheme()

  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  )
  const [selectingYear, setSelectingYear] = useState(false)

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

  const primaryColor = themeColor(theme.colors.primary)
  const roundness = theme.shapes.corner.extraSmall
  const selectColor = theme.colors.primaryContainer
  const selectColorValue = themeColor(selectColor)
  const startWeekOnMondayValue = startWeekOnMonday || false

  const renderHeader = useCallback(
    ({
      endInset,
      onNext,
      onPrev,
    }: {
      endInset?: number
      onNext: () => any
      onPrev: () => any
    }) => (
      <CalendarHeader
        disableWeekDays={disableWeekDays}
        endInset={endInset}
        locale={locale}
        onNext={onNext}
        onPrev={onPrev}
        scrollMode={scrollMode}
        startWeekOnMonday={startWeekOnMondayValue}
      />
    ),
    [disableWeekDays, locale, scrollMode, startWeekOnMondayValue]
  )

  const renderItem = useCallback(
    ({ index }: { index: number }) => (
      <Month
        date={date}
        dates={dates}
        dayContent={dayContent}
        dayContentPosition={dayContentPosition}
        dayContentStyle={dayContentStyle}
        disableWeekDays={disableWeekDays}
        endDate={endDate}
        endYear={endYear}
        index={index}
        key={index}
        locale={locale}
        mode={mode}
        onPressDate={onPressDate}
        onPressYear={onPressYear}
        primaryColor={primaryColor}
        roundness={roundness}
        scrollMode={scrollMode}
        selectColor={selectColorValue}
        selectingYear={selectingYear}
        startDate={startDate}
        startWeekOnMonday={startWeekOnMondayValue}
        startYear={startYear}
        validRange={validRange}
      />
    ),
    [
      date,
      dates,
      dayContent,
      dayContentPosition,
      dayContentStyle,
      disableWeekDays,
      endDate,
      endYear,
      locale,
      mode,
      onPressDate,
      onPressYear,
      primaryColor,
      roundness,
      scrollMode,
      selectColorValue,
      selectingYear,
      startDate,
      startWeekOnMondayValue,
      startYear,
      validRange,
    ]
  )

  return (
    <View style={[sharedStyles.root, sharedStyles.minHeightZero]}>
      <Swiper
        endYear={endYear}
        initialIndex={getInitialIndex(firstDate, startYear, endYear)}
        initialLayout={initialLayout}
        renderHeader={renderHeader}
        renderItem={renderItem}
        scrollMode={scrollMode}
        selectedYear={selectedYear}
        startWeekOnMonday={startWeekOnMondayValue}
        startYear={startYear}
      />
      {scrollMode === 'horizontal' && selectingYear ? (
        <YearPicker
          endYear={endYear || defaultEndYear}
          onPressYear={onPressYear}
          selectedYear={selectedYear}
          selectingYear={selectingYear}
          startYear={startYear || defaultStartYear}
        />
      ) : null}
    </View>
  )
}

export default memo(Calendar)
