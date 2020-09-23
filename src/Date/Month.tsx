import * as React from 'react'
import { I18nManager, StyleSheet, View } from 'react-native'
import { IconButton, Text, useTheme, TouchableRipple } from 'react-native-paper'
import Day, { EmptyDay } from './Day'

import {
  addMonths,
  areDatesOnSameDay,
  daySize,
  getDaysInMonth,
  getFirstDayOfMonth,
  getRealIndex,
  gridCounts,
  isDateBetween,
} from './dateUtils'
import { getCalendarHeaderHeight } from './CalendarHeader'

interface BaseMonthProps {
  scrollMode: 'horizontal' | 'vertical'

  mode: 'single' | 'range'
  date?: Date | null | undefined
  startDate?: Date | null | undefined
  endDate?: Date | null | undefined
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

const monthGrid = (index: number) => {
  console.log('', index, gridCounts[index])
  return Array(gridCounts[index])
    .fill(null)
    .map((_, weekGrid) => {
      const days = Array(7).fill(null)
      return { weekGrid, days }
    })
}

export function getMonthsOffset(
  scrollMode: 'horizontal' | 'vertical',
  index: number
) {
  const calendarHeight = getCalendarHeaderHeight(scrollMode)
  const monthsHeight =
    weekSize * gridCounts.slice(0, index).reduce((a, b) => a + b, 0)
  const extraHeight =
    scrollMode === 'horizontal' ? monthHeaderSingleHeight : montHeaderHeight

  const c = index * calendarHeight + monthsHeight + index * extraHeight

  return c || 0
}

export function getMonthHeight(
  scrollMode: 'horizontal' | 'vertical',
  index: number
): number {
  const calendarHeight = getCalendarHeaderHeight(scrollMode)
  const currentMonthHeight = weekSize * gridCounts[index]
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
}: MonthSingleProps | MonthRangeProps) {
  const theme = useTheme()
  const realIndex = getRealIndex(index)
  const isHorizontal = scrollMode === 'horizontal'

  const monthDate = addMonths(new Date(), realIndex)
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()

  const monthFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'long',
  })

  const monthName = monthFormatter.format(monthDate)

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

          const selected =
            mode === 'range' ? selectedStartDay || selectedEndDay : selectedDay
          let inRange =
            mode === 'range'
              ? isDateBetween(day, {
                  startDate,
                  endDate,
                })
              : false

          let leftCrop: boolean = selectedStartDay || dayOfMonth === 1
          let rightCrop: boolean = selectedEndDay || dayOfMonth === daysInMonth

          if (dayIndex === 0 && !selectedStartDay) {
            leftCrop = false
          }

          if (dayIndex === 6 && !selectedEndDay) {
            rightCrop = false
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
          }
        }),
      }
    })
  }, [mode, index, startDate, endDate, date, month, year])

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
          {generatedDays.map((gd) =>
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
