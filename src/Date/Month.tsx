import * as React from 'react'
import { I18nManager, StyleSheet, View } from 'react-native'
import { IconButton, Text, useTheme, TouchableRipple } from 'react-native-paper'
import Day, { EmptyDay } from './Day'

import {
  addMonths,
  areDatesOnSameDay,
  daySize,
  DisableWeekDaysType,
  getDaysInMonth,
  getFirstDayOfMonth,
  getRealIndex,
  getGridCount,
  isDateBetween,
  gridCounts,
  showWeekDay,
  startAtIndex,
  beginOffset,
  estimatedMonthHeight,
} from './dateUtils'
import { getCalendarHeaderHeight } from './CalendarHeader'
import { ModeType } from './Calendar'

interface BaseMonthProps {
  locale: undefined | string
  scrollMode: 'horizontal' | 'vertical'
  disableWeekDays?: DisableWeekDaysType
  mode: ModeType
  date?: Date | null | undefined
  startDate?: Date | null | undefined
  endDate?: Date | null | undefined
  excludedDates?: Date[]
  index: number
  onPressYear: (year: number) => any
  selectedYear: number | undefined
  selectingYear: boolean
  onPressDate: (date: Date) => any
  primaryColor: string
  selectColor: string
  roundness: number
}

interface MonthRangeProps extends BaseMonthProps {
  mode: 'range'
  startDate: Date | null | undefined
  endDate: Date | null | undefined
}

interface MonthSingleProps extends BaseMonthProps {
  mode: 'single'
  date?: Date | null | undefined
}

interface MonthExcludeInRangeProps extends BaseMonthProps {
  mode: 'excludeInRange'
  startDate: Date
  endDate: Date
}

const monthGrid = (index: number) => {
  return Array(getGridCount(index))
    .fill(null)
    .map((_, weekGrid) => {
      const days = Array(7).fill(null)
      return { weekGrid, days }
    })
}

function getIndexCount(index: number): number {
  if (index > startAtIndex) {
    return index - startAtIndex
  }

  return -(startAtIndex - index)
}

function weeksOffset(index: number): number {
  if (index === startAtIndex) {
    return 0
  }
  let off = 0
  if (index > startAtIndex) {
    for (let i = 0; i < index - startAtIndex; i++) {
      const cIndex = startAtIndex + i

      off += gridCounts[cIndex] || getGridCount(cIndex)
    }
  } else {
    for (let i = 0; i < startAtIndex - index; i++) {
      const cIndex = startAtIndex - i

      off -= gridCounts[cIndex] || getGridCount(cIndex)
    }
  }
  console.log('offsetBefore', getRealIndex(index), off)
  return off
}

export function getIndexFromOffset(offset: number): number {
  // 0 = 1
  let estimatedIndex = startAtIndex + Math.floor(offset / estimatedMonthHeight)
  console.log({ estimatedIndex })

  const realOffset = getMonthsOffset('vertical', estimatedIndex)

  const difference = (realOffset - beginOffset - offset) / estimatedMonthHeight

  if (difference >= 1 || difference <= -1) {
    estimatedIndex -= Math.floor(difference)
  }

  return estimatedIndex
}

export function getMonthsOffset(
  scrollMode: 'horizontal' | 'vertical',
  index: number
) {
  const count = getIndexCount(index)

  const ob = weeksOffset(index)

  const calendarHeight = getCalendarHeaderHeight(scrollMode)
  const monthsHeight = weekSize * ob

  const extraHeight =
    scrollMode === 'horizontal' ? monthHeaderSingleHeight : montHeaderHeight

  const c = monthsHeight + count * (calendarHeight + extraHeight)
  const off = (c || 0) + beginOffset

  return off
}

export function getMonthHeight(
  scrollMode: 'horizontal' | 'vertical',
  index: number
): number {
  const calendarHeight = getCalendarHeaderHeight(scrollMode)
  const gc = getGridCount(index)

  const currentMonthHeight = weekSize * gc
  const extraHeight =
    scrollMode === 'horizontal' ? monthHeaderSingleHeight : montHeaderHeight
  const c = calendarHeight + currentMonthHeight + extraHeight
  return c || 0
}

function Month({
  index,
  mode,
  date,
  startDate,
  endDate,
  onPressYear,
  // selectedYear, // TODO: scroll to right month in another year
  selectingYear,
  onPressDate,
  scrollMode,
  primaryColor,
  selectColor,
  roundness,
  disableWeekDays,
  excludedDates,
  locale,
}: MonthSingleProps | MonthRangeProps | MonthExcludeInRangeProps) {
  const theme = useTheme()
  const realIndex = getRealIndex(index)
  const isHorizontal = scrollMode === 'horizontal'

  const { monthName, month, year } = React.useMemo(() => {
    const md = addMonths(new Date(), realIndex)
    const y = md.getFullYear()
    const m = md.getMonth()
    const formatter = new Intl.DateTimeFormat(locale, {
      month: 'long',
    })
    return { monthName: formatter.format(md), month: m, year: y }
  }, [realIndex, locale])

  const grid = React.useMemo(() => {
    const today = new Date()

    const daysInMonth = getDaysInMonth({ year, month })
    const dayOfWeek = getFirstDayOfMonth({ year, month })
    const emptyDays = dayOfWeek

    return monthGrid(index).map(({ days, weekGrid }) => {
      return {
        weekIndex: weekGrid,
        generatedDays: days.map((_, dayIndex) => {
          const isFirstWeek = weekGrid === 0
          const realDayIndex = emptyDays - dayIndex
          const beforeWeekDay = isFirstWeek && realDayIndex > 0
          const dayOfMonth = weekGrid * 7 + dayIndex - emptyDays + 1
          const afterWeekDay = dayOfMonth > daysInMonth

          const day = new Date(year, month, dayOfMonth)
          const isToday = areDatesOnSameDay(day, today)
          const selectedStartDay = areDatesOnSameDay(day, startDate)
          const selectedEndDay = areDatesOnSameDay(day, endDate)
          const selectedDay = areDatesOnSameDay(day, date)

          let disabled = mode === 'excludeInRange'
          let selected =
            mode === 'range' || mode === 'excludeInRange'
              ? selectedStartDay || selectedEndDay
              : selectedDay
          let inRange =
            mode === 'range' || mode === 'excludeInRange'
              ? isDateBetween(day, {
                  startDate,
                  endDate,
                })
              : false

          if (inRange) {
            disabled = false
          }

          let leftCrop: boolean = selectedStartDay || dayOfMonth === 1
          let rightCrop: boolean = selectedEndDay || dayOfMonth === daysInMonth

          let excluded = false
          if (excludedDates) {
            if (excludedDates.some((ed) => areDatesOnSameDay(day, ed))) {
              excluded = true
              inRange = false
              selected = false
            } else {
              const yesterday = new Date(year, month, dayOfMonth - 1)
              const tomorrow = new Date(year, month, dayOfMonth + 1)
              if (
                excludedDates.some((ed) => areDatesOnSameDay(yesterday, ed))
              ) {
                leftCrop = true
              }
              if (excludedDates.some((ed) => areDatesOnSameDay(tomorrow, ed))) {
                rightCrop = true
              }
            }
          }

          if (dayIndex === 0 && !selectedStartDay) {
            leftCrop = false
          }

          if (dayIndex === 6 && !selectedEndDay) {
            rightCrop = false
          }

          if (
            (dayOfMonth === 1 && selectedEndDay) ||
            (dayOfMonth === daysInMonth && selectedStartDay)
          ) {
            inRange = false
          }

          return {
            beforeWeekDay,
            afterWeekDay,
            year,
            month,
            dayOfMonth,
            dayIndex,
            mode,
            selected,
            inRange,
            leftCrop,
            rightCrop,
            isToday,
            disabled,
            excluded,
          }
        }),
      }
    })
  }, [mode, index, startDate, endDate, date, month, year, excludedDates])

  return (
    <View style={[styles.month, { height: getMonthHeight(scrollMode, index) }]}>
      <View
        style={[
          styles.monthHeader,
          isHorizontal
            ? {
                marginTop: monthHeaderSingleMarginTop,
                marginBottom: monthHeaderSingleMarginBottom,
              }
            : null,
        ]}
      >
        <TouchableRipple
          disabled={!isHorizontal}
          onPress={isHorizontal ? () => onPressYear(year) : undefined}
          style={[
            styles.yearButton,
            {
              borderRadius: roundness,
            },
          ]}
        >
          <View
            style={[
              styles.yearButtonInner,
              {
                borderRadius: roundness,
              },
            ]}
          >
            <Text
              style={[styles.monthLabel, theme.fonts.medium]}
              selectable={false}
            >
              {monthName} {year}
            </Text>
            <View style={isHorizontal ? styles.opacity1 : styles.opacity0}>
              <IconButton
                onPress={isHorizontal ? () => onPressYear(year) : undefined}
                icon={selectingYear ? 'chevron-up' : 'chevron-down'}
              />
            </View>
          </View>
        </TouchableRipple>
      </View>

      {grid.map(({ weekIndex, generatedDays }) => (
        <View
          style={[styles.week, I18nManager.isRTL ? styles.weekRtl : null]}
          key={weekIndex}
        >
          {generatedDays
            .filter((gd) => showWeekDay(gd.dayIndex, disableWeekDays))
            .map((gd) =>
              gd.beforeWeekDay || gd.afterWeekDay ? (
                <EmptyDay key={gd.dayIndex} />
              ) : (
                <Day
                  key={gd.dayIndex}
                  day={gd.dayOfMonth}
                  month={gd.month}
                  year={gd.year}
                  selected={gd.selected}
                  inRange={gd.inRange}
                  leftCrop={gd.leftCrop}
                  rightCrop={gd.rightCrop}
                  onPressDate={onPressDate}
                  isToday={gd.isToday}
                  selectColor={selectColor}
                  primaryColor={primaryColor}
                  disabled={gd.disabled}
                  excluded={gd.excluded}
                />
              )
            )}
        </View>
      ))}
    </View>
  )
}

export const weekMargin = 6
export const weekSize = daySize + weekMargin
const montHeaderHeight = 56
const monthHeaderSingleMarginTop = 4
const monthHeaderSingleMarginBottom = 8 + 44 + 12
const monthHeaderSingleHeight =
  monthHeaderSingleMarginTop + monthHeaderSingleMarginBottom

const styles = StyleSheet.create({
  week: {
    flexDirection: 'row',
    marginBottom: weekMargin,
    height: daySize,
  },
  weekRtl: {
    // flexDirection: 'row-reverse',
  },
  month: {},

  monthHeader: {
    height: montHeaderHeight,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  monthLabel: { fontSize: 14, opacity: 0.7 },
  yearButton: { alignSelf: 'flex-start', marginLeft: 6 },
  yearButtonInner: {
    paddingLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  opacity0: { opacity: 0 },
  opacity1: { opacity: 1 },
})

export default React.memo(Month)
