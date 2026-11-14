import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import Swiper from './Swiper'
import Month from './Month'
import {
  areDatesOnSameDay,
  dateToUnix,
  defaultEndYear,
  defaultStartYear,
  getEndOfDay,
  getInitialIndex,
} from './dateUtils'
import type {
  CalendarDate,
  CalendarDates,
  DayContentPosition,
  DayContentRenderer,
  DisableWeekDaysType,
  ModeType,
  MultiCalendarMode,
  MultiChange,
  MultiConfirm,
  RangeCalendarMode,
  RangeChange,
  ScrollModeType,
  SingleCalendarMode,
  SingleChange,
  ValidRangeType,
} from './types'
import CalendarHeader from './CalendarHeader'
import { memo, useCallback, useState } from 'react'
import YearPicker from './YearPicker'
import { useTheme } from 'react-native-paper'
import { themeColor, useLatest } from '../shared/utils'
import { sharedStyles } from '../shared/styles'

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
  initialLayout?: { height: number; width: number }
  locale: string
  startDate?: CalendarDate
  startWeekOnMonday?: boolean
  startYear?: number
  validRange?: ValidRangeType
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
  const datesRef = useLatest<CalendarDates>(dates)
  const endDateRef = useLatest<CalendarDate>(endDate)
  const firstDate = startDate || date || dates?.[0]
  const onChangeRef = useLatest<RangeChange | SingleChange | MultiChange>(
    onChange
  )
  const scrollMode =
    mode === 'range' || mode === 'multiple' ? 'vertical' : 'horizontal'
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  )
  const [selectingYear, setSelectingYear] = useState(false)
  const onPressYear = useCallback(
    (year: number) => {
      setSelectedYear(year)
      setSelectingYear((prev) => !prev)
    },
    [setSelectingYear]
  )
  const startDateRef = useLatest<CalendarDate>(startDate)
  const onPressDate = useCallback(
    (d: Date) => {
      if (mode === 'single') {
        ;(onChangeRef.current as SingleChange)({
          date: dateMode === 'start' ? d : getEndOfDay(d),
        })
      } else if (mode === 'range') {
        const ed = endDateRef.current
        let isStart: boolean = true
        const sd = startDateRef.current
        if (sd && !ed && dateToUnix(d) >= dateToUnix(sd!)) {
          isStart = false
        }
        ;(onChangeRef.current as RangeChange)({
          endDate: !isStart ? getEndOfDay(d) : undefined,
          startDate: isStart ? d : sd,
        })
      } else if (mode === 'multiple') {
        datesRef.current = datesRef.current || []
        const exists = datesRef.current.some((ed) => areDatesOnSameDay(ed, d))

        const newDates = exists
          ? datesRef.current.filter((ed) => !areDatesOnSameDay(ed, d))
          : [...datesRef.current, d]

        newDates.sort((a, b) => a.getTime() - b.getTime())
        ;(onChangeRef.current as MultiChange)({
          change: exists ? 'removed' : 'added',
          datePressed: d,
          dates: newDates,
        })
      }
    },
    [mode, dateMode, onChangeRef, startDateRef, endDateRef, datesRef]
  )
  const startWeekOnMondayValue = startWeekOnMonday || false
  const renderHeader = useCallback(
    ({
      endInset,
      onNext,
      onPrev,
    }: {
      endInset?: number
      onNext: () => void
      onPrev: () => void
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
  const theme = useTheme()
  const primaryColor = themeColor(theme.colors.primary)
  const roundness = theme.shapes.corner.extraSmall
  const selectColor = theme.colors.primaryContainer
  const selectColorValue = themeColor(selectColor)
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

export type {
  CalendarDate,
  CalendarDates,
  DayContentPosition,
  DayContentRenderer,
  ModeType,
  MultiChange,
  MultiConfirm,
  RangeChange,
  ScrollModeType,
  SingleChange,
  ValidRangeType,
}

export type CalendarMultiProps = BaseCalendarProps &
  MultiCalendarMode & {
    onChange: MultiChange
  }

export type CalendarRangeProps = BaseCalendarProps &
  RangeCalendarMode & {
    onChange: RangeChange
  }

export type CalendarSingleProps = BaseCalendarProps &
  SingleCalendarMode & {
    onChange: SingleChange
  }

export default memo(Calendar)
