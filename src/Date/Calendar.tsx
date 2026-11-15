import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import Swiper from './Swiper'
import Month from './Month'
import {
  addMonths,
  areDatesOnSameDay,
  dateToUnix,
  defaultEndYear,
  defaultStartYear,
  getDaysInMonth,
  getEndOfDay,
  getInitialIndex,
} from './dateUtils'
import MonthMenu from './MonthMenu'
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
import { memo, useCallback, useEffect, useState } from 'react'
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
  keyboardEnabled?: boolean
  locale: string
  onKeyboardConfirm?: () => void
  onSelectingYearChange?: (selectingYear: boolean) => void
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
    keyboardEnabled = true,
    locale,
    mode,
    onKeyboardConfirm,
    onChange,
    onSelectingYearChange,
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
  const [focusedDate, setFocusedDate] = useState<Date | undefined>(undefined)
  const [navigateDate, setNavigateDate] = useState<Date | undefined>(undefined)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  )
  const [selectingMonth, setSelectingMonth] = useState(false)
  const [selectingYear, setSelectingYear] = useState(false)

  useEffect(() => {
    onSelectingYearChange?.(scrollMode === 'horizontal' && selectingYear)
  }, [onSelectingYearChange, scrollMode, selectingYear])
  const onMoveFocus = useCallback(
    (delta: number) => {
      setFocusedDate((prev) => addMonths(prev || date || new Date(), delta))
    },
    [date]
  )
  const onOpenMonthMenu = useCallback(() => {
    setSelectingYear(false)
    setSelectingMonth((prev) => !prev)
  }, [])
  const onOpenYearMenu = useCallback(() => {
    const year = (focusedDate || date || new Date()).getFullYear()
    setSelectedYear(year)
    setSelectingMonth(false)
    setSelectingYear(true)
  }, [date, focusedDate])
  const onPressMonth = useCallback(
    (month: number) => {
      const base = focusedDate || date || new Date()
      const day = Math.min(
        base.getDate(),
        getDaysInMonth({ month, year: base.getFullYear() })
      )
      const next = new Date(base.getFullYear(), month, day)
      setFocusedDate(next)
      setNavigateDate(next)
      setSelectingMonth(false)
    },
    [date, focusedDate]
  )
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
        selectingYear={selectingYear}
        startWeekOnMonday={startWeekOnMondayValue}
      />
    ),
    [disableWeekDays, locale, scrollMode, selectingYear, startWeekOnMondayValue]
  )
  const theme = useTheme()
  const primaryColor = themeColor(theme.colors.primary)
  const roundness = theme.shapes.corner.extraSmall
  const selectColor = theme.colors.secondaryContainer
  const selectColorValue = themeColor(selectColor)
  const renderItem = useCallback(
    ({ active, index }: { active?: boolean; index: number }) => (
      <Month
        date={date}
        dates={dates}
        dayContent={dayContent}
        dayContentPosition={dayContentPosition}
        dayContentStyle={dayContentStyle}
        disableWeekDays={disableWeekDays}
        endDate={endDate}
        endYear={endYear}
        focusedDate={focusedDate}
        index={index}
        key={index}
        locale={locale}
        mode={mode}
        onNavigateToDate={active === false ? undefined : setNavigateDate}
        onPressDate={onPressDate}
        onPressYear={onPressYear}
        primaryColor={primaryColor}
        roundness={roundness}
        scrollMode={scrollMode}
        selectColor={selectColorValue}
        selectingYear={selectingYear}
        showOutsideDays={scrollMode === 'horizontal' && active !== false}
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
      focusedDate,
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
        focusDate={navigateDate}
        initialIndex={getInitialIndex(firstDate, startYear, endYear)}
        initialLayout={initialLayout}
        keyboardEnabled={keyboardEnabled}
        onFocusDate={setFocusedDate}
        onKeyboardConfirm={onKeyboardConfirm}
        onMoveFocus={onMoveFocus}
        onOpenMonthMenu={onOpenMonthMenu}
        onOpenYearMenu={onOpenYearMenu}
        renderHeader={renderHeader}
        renderItem={renderItem}
        scrollMode={scrollMode}
        selectedYear={selectedYear}
        startWeekOnMonday={startWeekOnMondayValue}
        startYear={startYear}
      />
      {scrollMode === 'horizontal' && selectingMonth ? (
        <MonthMenu
          locale={locale}
          onPressMonth={onPressMonth}
          selectedMonth={(focusedDate || date || new Date()).getMonth()}
        />
      ) : null}
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
