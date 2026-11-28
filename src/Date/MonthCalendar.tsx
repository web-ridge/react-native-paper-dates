import { type ReactNode, useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { themeColor, useLatest } from '../shared/utils'
import { useDatePickerKeys } from './datePickerKeys'
import {
  addMonths,
  dayCellSize,
  daySize,
  defaultEndYear,
  defaultStartYear,
  getEndOfDay,
  getInitialIndex,
  moveEnabledCalendarDay,
} from './dateUtils'
import DayNames from './DayNames'
import Month from './Month'
import MonthMenu from './MonthMenu'
import type {
  CalendarDate,
  DisableWeekDaysType,
  SingleChange,
  ValidRangeType,
} from './types'
import YearPicker from './YearPicker'

export type MonthCalendarNav = {
  body: ReactNode
  menu: 'day' | 'month' | 'year'
  moveMonth: (delta: number) => void
  moveYear: (delta: number) => void
  resolvedDate: CalendarDate
  toggleMonth: () => void
  toggleYear: () => void
  visibleMonth: Date
}

const actionHeight = 36
const actionPaddingBottom = 12
const actionPaddingTop = 8
const headerPaddingBottom = 0
const menuDividerOffset = 0
const menuPaddingBottom = 20
const weekdayGridGap = 16
const weekdayRowHeight = 24

const menuHeight =
  weekdayRowHeight +
  weekdayGridGap +
  dayCellSize * 6 +
  actionPaddingTop +
  actionHeight +
  actionPaddingBottom

export function renderMonthBody(navigation: MonthCalendarNav) {
  return navigation.body
}

function MonthCalendar({
  children,
  date,
  dateMode,
  disableWeekDays,
  endYear,
  locale,
  onChange,
  onMonthConfirm,
  startWeekOnMonday,
  startYear,
  validRange,
}: {
  children: (navigation: MonthCalendarNav) => ReactNode
  date?: CalendarDate
  dateMode?: 'start' | 'end'
  disableWeekDays?: DisableWeekDaysType
  endYear?: number
  locale: string
  onChange: SingleChange
  onMonthConfirm?: SingleChange
  startWeekOnMonday?: boolean
  startYear?: number
  validRange?: ValidRangeType
}) {
  const theme = useTheme()

  const [draft, setDraft] = useState<CalendarDate>(date)
  const [focusedDate, setFocusedDate] = useState<Date | undefined>(date)
  const [menu, setMenu] = useState<'day' | 'month' | 'year'>('day')

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = date ?? new Date()
    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })

  const onChangeRef = useLatest(onChange)
  const onMonthConfirmRef = useLatest(onMonthConfirm)

  const monday = startWeekOnMonday ?? false

  const resolvedDate = focusedDate
    ? dateMode === 'end'
      ? getEndOfDay(focusedDate)
      : focusedDate
    : draft

  const resolvedDateRef = useLatest(resolvedDate)

  const resolvedEndYear = endYear ?? defaultEndYear
  const resolvedStartYear = startYear ?? defaultStartYear

  const index = getInitialIndex(
    visibleMonth,
    resolvedStartYear,
    resolvedEndYear
  )

  const commitDate = useCallback(
    (next: Date) => {
      const normalized = dateMode === 'end' ? getEndOfDay(next) : next
      setDraft(normalized)
      setFocusedDate(next)
      setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1))
      onChangeRef.current({ date: normalized })
    },
    [dateMode, onChangeRef]
  )

  const moveMonth = useCallback(
    (delta: number) => {
      setVisibleMonth((current) => {
        const next = addMonths(current, delta)
        const year = next.getFullYear()
        if (year < resolvedStartYear || year > resolvedEndYear) return current
        return new Date(next.getFullYear(), next.getMonth(), 1)
      })
    },
    [resolvedEndYear, resolvedStartYear]
  )

  const moveYear = useCallback(
    (delta: number) => {
      setVisibleMonth((current) => {
        const year = current.getFullYear() + delta
        if (year < resolvedStartYear || year > resolvedEndYear) return current
        return new Date(year, current.getMonth(), 1)
      })
    },
    [resolvedEndYear, resolvedStartYear]
  )

  const showMonth = useCallback((next: Date) => {
    setFocusedDate(next)
    setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1))
  }, [])

  const toggleMonth = useCallback(() => {
    setMenu((current) => (current === 'month' ? 'day' : 'month'))
  }, [])

  const toggleYear = useCallback(() => {
    setMenu((current) => (current === 'year' ? 'day' : 'year'))
  }, [])

  const body = (
    <>
      {menu === 'month' ? (
        <View style={styles.menu}>
          <MonthMenu
            embedded
            locale={locale}
            onPressMonth={(month) => {
              setVisibleMonth(new Date(visibleMonth.getFullYear(), month, 1))
              setMenu('day')
            }}
            selectedMonth={visibleMonth.getMonth()}
          />
        </View>
      ) : null}
      {menu === 'year' ? (
        <View style={styles.menu}>
          <YearPicker
            embedded
            endYear={resolvedEndYear}
            onPressYear={(year) => {
              setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1))
              setMenu('day')
            }}
            selectedYear={visibleMonth.getFullYear()}
            selectingYear
            startYear={resolvedStartYear}
            variant="menu"
          />
        </View>
      ) : null}
      {menu === 'day' ? (
        <View accessibilityRole="grid" role="grid" style={styles.grid}>
          <View style={styles.weekdays}>
            <DayNames
              backgroundColor="transparent"
              disableWeekDays={disableWeekDays}
              height={weekdayRowHeight}
              locale={locale}
              startWeekOnMonday={monday}
            />
          </View>
          <Month
            date={draft}
            disableWeekDays={disableWeekDays}
            endYear={resolvedEndYear}
            focusedDate={focusedDate}
            hideHeader
            index={index}
            indicatorSize={daySize}
            locale={locale}
            mode="single"
            onPressDate={commitDate}
            onPressYear={toggleYear}
            primaryColor={themeColor(theme.colors.primary)}
            roundness={theme.shapes.corner.extraSmall}
            scrollMode="horizontal"
            selectColor={themeColor(theme.colors.secondaryContainer)}
            selectingYear={false}
            showOutsideDays
            startWeekOnMonday={monday}
            startYear={resolvedStartYear}
            validRange={validRange}
          />
        </View>
      ) : null}
    </>
  )

  useDatePickerKeys(menu === 'day', {
    getVisibleMonth: () => visibleMonth,
    onConfirm: () => {
      onMonthConfirmRef.current?.({ date: resolvedDateRef.current })
    },
    onFocusDate: showMonth,
    onMoveDay: (deltaDays) => {
      const next = moveEnabledCalendarDay(
        focusedDate || draft || visibleMonth,
        deltaDays,
        {
          disabledDates: validRange?.disabledDates,
          endDate: validRange?.endDate,
          endYear: resolvedEndYear,
          startDate: validRange?.startDate,
          startYear: resolvedStartYear,
        }
      )
      if (next) showMonth(next)
    },
    onMoveFocus: (delta) => {
      const base = focusedDate || draft || visibleMonth
      const next = addMonths(base, delta)
      if (
        next.getFullYear() < resolvedStartYear ||
        next.getFullYear() > resolvedEndYear
      ) {
        return
      }
      showMonth(next)
    },
    onMoveMonth: moveMonth,
    onOpenMonthMenu: toggleMonth,
    onOpenYearMenu: toggleYear,
  })

  return children({
    body,
    menu,
    moveMonth,
    moveYear,
    resolvedDate,
    toggleMonth,
    toggleYear,
    visibleMonth,
  })
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 12,
  },
  menu: {
    height: menuHeight,
    marginTop: headerPaddingBottom - menuDividerOffset,
    paddingBottom: menuPaddingBottom,
  },
  weekdays: {
    marginBottom: weekdayGridGap,
  },
})

export default MonthCalendar
