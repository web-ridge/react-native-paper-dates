import * as React from 'react'
import { StyleSheet, View } from 'react-native'

import Swiper from './Swiper'

import Month from './Month'
import { areDatesOnSameDay, dateToUnix, DisableWeekDaysType } from './dateUtils'

import CalendarHeader from './CalendarHeader'
import { useCallback, useMemo } from 'react'
import YearPicker from './YearPicker'
import Color from 'color'
import { useTheme } from 'react-native-paper'
import { useLatest } from '../utils'

export type ModeType = 'single' | 'range' | 'excludeInRange'

export type ScrollModeType = 'horizontal' | 'vertical'

export type BaseCalendarProps = {
  locale?: undefined | string
  disableWeekDays?: DisableWeekDaysType
}

export type CalendarDate = Date | undefined

export type ExcludeInRangeChange = (params: { excludedDates: Date[] }) => any

export type RangeChange = (params: {
  startDate: CalendarDate
  endDate: CalendarDate
}) => any

export type SingleChange = (params: { date: CalendarDate }) => any

export interface CalendarSingleProps extends BaseCalendarProps {
  mode: 'single'
  date?: CalendarDate
  onChange: SingleChange
}

export interface CalendarRangeProps extends BaseCalendarProps {
  mode: 'range'
  startDate: CalendarDate
  endDate: CalendarDate
  onChange: RangeChange
}

export interface CalendarExcludeInRangeProps extends BaseCalendarProps {
  mode: 'excludeInRange'
  excludedDates: Date[]
  startDate: CalendarDate
  endDate: CalendarDate
  onChange: ExcludeInRangeChange
}

function Calendar(
  props: CalendarSingleProps | CalendarRangeProps | CalendarExcludeInRangeProps
) {
  const {
    locale,
    mode,
    onChange,
    // @ts-ignore
    startDate,
    // @ts-ignore
    endDate,
    // @ts-ignore
    date,
    // @ts-ignore
    excludedDates,
    disableWeekDays,
  } = props

  const theme = useTheme()

  const selectColor = useMemo<string>(() => {
    if (theme.dark) {
      return Color(theme.colors.primary).hex()
    }
    return Color(theme.colors.primary).lighten(0.9).hex()
  }, [theme])

  const scrollMode =
    mode === 'range' || mode === 'excludeInRange' ? 'vertical' : 'horizontal'

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
  const excludedDatesRef = useLatest<Date[]>(excludedDates)
  const endDateRef = useLatest<CalendarDate>(endDate)
  const onChangeRef = useLatest<
    RangeChange | SingleChange | ExcludeInRangeChange
  >(onChange)

  const onPressDate = useCallback(
    (d: Date) => {
      if (mode === 'single') {
        ;(onChangeRef.current as SingleChange)({
          date: d,
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
          endDate: !isStart
            ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
            : undefined,
        })
      } else if (mode === 'excludeInRange') {
        const exists = excludedDatesRef.current.some((ed) =>
          areDatesOnSameDay(ed, d)
        )
        const newExcludedDates = exists
          ? excludedDatesRef.current.filter((ed) => !areDatesOnSameDay(ed, d))
          : [
              ...excludedDatesRef.current,
              new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0),
            ]
        newExcludedDates.sort((a, b) => a.getTime() - b.getTime())
        ;(onChangeRef.current as ExcludeInRangeChange)({
          excludedDates: newExcludedDates,
        })
      }
    },
    [mode, onChangeRef, startDateRef, endDateRef, excludedDatesRef]
  )

  return (
    <View style={styles.root}>
      <Swiper
        selectedYear={selectedYear}
        scrollMode={scrollMode}
        renderItem={({ index }) => (
          <Month
            locale={locale}
            mode={mode}
            key={index}
            index={index}
            startDate={startDate}
            endDate={endDate}
            date={date}
            onPressYear={onPressYear}
            selectedYear={selectedYear}
            selectingYear={selectingYear}
            onPressDate={onPressDate}
            scrollMode={scrollMode}
            primaryColor={theme.colors.primary}
            selectColor={selectColor}
            roundness={theme.roundness}
            disableWeekDays={disableWeekDays}
            excludedDates={excludedDates}
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
