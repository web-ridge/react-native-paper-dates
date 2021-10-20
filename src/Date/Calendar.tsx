import * as React from 'react'
import { StyleSheet, View } from 'react-native'
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
import { useCallback, useMemo } from 'react'
import YearPicker from './YearPicker'
import Color from 'color'
import { useTheme } from 'react-native-paper'
import { useLatest, lightenBy, darkenBy } from '../utils'

export type ModeType = 'single' | 'range' | 'multiple'

export type ScrollModeType = 'horizontal' | 'vertical'

export type ValidRangeType = {
  startDate?: Date
  endDate?: Date
  disabledDates?: Date[]
}

export type BaseCalendarProps = {
  locale: string
  disableWeekDays?: DisableWeekDaysType
  validRange?: ValidRangeType

  // here they are optional but in final implemenation they are required
  date?: CalendarDate
  dates?: CalendarDates
  startDate?: CalendarDate
  endDate?: CalendarDate
  dateMode?: 'start' | 'end'
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
    dates,
    validRange,
    dateMode,
  } = props

  const theme = useTheme()

  const selectColor = useMemo<string>(() => {
    if (theme.dark) {
      return darkenBy(Color(theme.colors.primary), 0.9).hex()
    }
    return lightenBy(Color(theme.colors.primary), 0.9).hex()
  }, [theme])

  const scrollMode =
    mode === 'range' || mode === 'multiple' ? 'vertical' : 'horizontal'

  const [selectedYear, setSelectedYear] = React.useState<number | undefined>(
    undefined
  )
  const [selectingYear, setSelectingYear] = React.useState<boolean>(false)
  const onPressYear = useCallback(
    (year: number) => {
      setSelectedYear(year)
      setSelectingYear((prev) => !prev)
    },
    [setSelectingYear]
  )

  // prevent re-rendering all months when something changed we only need the
  // latest version of the props and we don't want the useCallback to change
  const startDateRef = useLatest<CalendarDate>(startDate)
  const endDateRef = useLatest<CalendarDate>(endDate)
  const onChangeRef = useLatest<RangeChange | SingleChange | MultiChange>(
    onChange
  )
  const datesRef = useLatest<CalendarDates>(dates)

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
        if (sd && !ed && dateToUnix(d) > dateToUnix(sd!)) {
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

  const firstDate = startDate || date || dates?.[0]

  return (
    <View style={styles.root}>
      <Swiper
        initialIndex={getInitialIndex(firstDate)}
        selectedYear={selectedYear}
        scrollMode={scrollMode}
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
          />
        )}
        renderHeader={({ onPrev, onNext }) => (
          <CalendarHeader
            locale={locale}
            onPrev={onPrev}
            onNext={onNext}
            scrollMode={scrollMode}
            disableWeekDays={disableWeekDays}
          />
        )}
      />
      {scrollMode === 'horizontal' ? (
        <YearPicker
          selectedYear={selectedYear}
          selectingYear={selectingYear}
          onPressYear={onPressYear}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  viewPager: { flex: 1 },
})

export default React.memo(Calendar)
