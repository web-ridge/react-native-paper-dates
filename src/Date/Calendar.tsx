import * as React from 'react'
import { StyleSheet, View } from 'react-native'

import Swiper from './Swiper'

import Month from './Month'
import { dateToUnix } from './dateUtils'

import CalendarHeader from './CalendarHeader'
import { useCallback, useMemo } from 'react'
import YearPicker from './YearPicker'
import Color from 'color'
import { useTheme } from 'react-native-paper'
import { useLatest } from '../utils'

export type ModeType = 'single' | 'range'

export type ScrollModeType = 'horizontal' | 'vertical'

export type BaseCalendarProps = {
  scrollMode?: ScrollModeType
}

export type CalendarDate = Date | undefined

export type RangeChange = (params: {
  startDate: CalendarDate
  endDate: CalendarDate
}) => any

export type SingleChange = (params: { date: CalendarDate }) => any

export interface CalendarRangeProps extends BaseCalendarProps {
  mode: 'range'
  startDate: CalendarDate
  endDate: CalendarDate
  onChange: RangeChange
}

export interface CalendarSingleProps extends BaseCalendarProps {
  mode: 'single'
  date?: CalendarDate
  onChange: SingleChange
}

function Calendar(props: CalendarSingleProps | CalendarRangeProps) {
  const {
    mode,
    onChange,
    // @ts-ignore
    startDate,
    // @ts-ignore
    endDate,
    // @ts-ignore
    date,
  } = props

  const theme = useTheme()

  const selectColor = useMemo<string>(() => {
    if (theme.dark) {
      return Color(theme.colors.primary).hex()
    }
    return Color(theme.colors.primary).lighten(0.9).hex()
  }, [theme])

  const detectedScrollMode = mode === 'range' ? 'vertical' : 'horizontal'
  const scrollMode = props.scrollMode ? props.scrollMode : detectedScrollMode

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
  const onChangeRef = useLatest<RangeChange | SingleChange>(onChange)

  const onPressDate = useCallback(
    (d: Date) => {
      if (mode === 'single') {
        onChangeRef.current({
          startDate: undefined,
          endDate: undefined,
          date: d,
        })
      } else if (mode === 'range') {
        const sd = startDateRef.current
        const ed = endDateRef.current
        let isStart: boolean = true
        if (sd && !ed && dateToUnix(d) > dateToUnix(sd!)) {
          isStart = false
        }
        onChangeRef.current({
          startDate: isStart ? d : sd,
          endDate: !isStart
            ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
            : undefined,
          date: undefined,
        })
      }
    },
    [mode, onChangeRef, startDateRef, endDateRef]
  )

  return (
    <View style={styles.root}>
      <Swiper
        scrollMode={scrollMode}
        renderItem={({ index }) => {
          return (
            <Month
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
            />
          )
        }}
        renderHeader={({ onPrev, onNext }) => (
          <CalendarHeader
            onPrev={onPrev}
            onNext={onNext}
            scrollMode={scrollMode}
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
