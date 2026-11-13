import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper'
import Day, { EmptyDay } from './Day'

import {
  addMonths,
  adjacentDayKey,
  areDatesOnSameDay,
  calendarDateKey,
  calendarDayKey,
  dateToUnix,
  daySize,
  defaultEndYear,
  defaultStartYear,
  DisableWeekDaysType,
  estimatedMonthHeight,
  getDaysInMonth,
  getEndOfDay,
  getFirstDayOfMonth,
  getGridCount,
  getRealIndex,
  getStartAtIndex,
  getStartOfDay,
  getTotalMonths,
  showWeekDay,
  useRangeChecker,
} from './dateUtils'
import { alignTextToFirstWeekday } from './weekdayColumns'
import { getCalendarHeaderHeight } from './CalendarHeader'
import type { StyleProp, ViewStyle } from 'react-native'
import type {
  CalendarDate,
  CalendarDates,
  DayContentPosition,
  DayContentRenderer,
  ModeType,
  ValidRangeType,
} from './Calendar'
import { dayNamesHeight } from './DayNames'
import { useTextColorOnPrimary } from '../shared/utils'
import { memo, useMemo } from 'react'
import { sharedStyles } from '../shared/styles'

interface BaseMonthProps {
  date?: CalendarDate
  dates?: CalendarDates
  dayContent?: DayContentRenderer
  dayContentPosition?: DayContentPosition
  dayContentStyle?: StyleProp<ViewStyle>
  disableWeekDays?: DisableWeekDaysType
  endDate?: CalendarDate
  endYear?: number
  index: number
  locale: undefined | string
  mode: ModeType
  onPressDate: (date: Date) => any
  onPressYear: (year: number) => any
  primaryColor: string
  roundness: number
  scrollMode: 'horizontal' | 'vertical'
  selectColor: string
  selectingYear: boolean
  // some of these should be required in final implementation
  startDate?: CalendarDate
  startWeekOnMonday: boolean
  startYear?: number
  validRange?: ValidRangeType
}

interface MonthRangeProps extends BaseMonthProps {
  endDate: CalendarDate
  mode: 'range'
  startDate: CalendarDate
}

interface MonthSingleProps extends BaseMonthProps {
  date: CalendarDate
  mode: 'single'
}

interface MonthMultiProps extends BaseMonthProps {
  dates: CalendarDates
  mode: 'multiple'
}

function Month(props: MonthSingleProps | MonthRangeProps | MonthMultiProps) {
  const {
    date,
    dates,
    dayContent,
    dayContentPosition,
    dayContentStyle,
    disableWeekDays,
    endDate,
    endYear,
    index,
    locale,
    mode,
    onPressDate,
    onPressYear,
    primaryColor,
    roundness,
    scrollMode,
    selectColor,
    selectingYear,
    startDate,
    startWeekOnMonday,
    startYear,
    validRange,
  } = props
  const isHorizontal = scrollMode === 'horizontal'

  const theme = useTheme()
  const textColorOnPrimary = useTextColorOnPrimary()
  const realIndex = getRealIndex(index, startYear, endYear)
  const { isDisabled, isWithinValidRange } = useRangeChecker(validRange)
  const selectedKeys = useMemo(() => {
    const keys = new Set<string>()
    if (dates) {
      for (const selected of dates) {
        keys.add(calendarDateKey(selected))
      }
    }
    return keys
  }, [dates])

  const { monthName, month, year } = useMemo(() => {
    const md = addMonths(new Date(), realIndex)
    const y = md.getFullYear()
    const m = md.getMonth()
    const formatter = new Intl.DateTimeFormat(locale, {
      month: 'long',
    })
    return { monthName: formatter.format(md), month: m, year: y }
  }, [realIndex, locale])

  const grid = useMemo(() => {
    const today = new Date()

    const daysInMonth = getDaysInMonth({ year, month })
    const dayOfWeek = getFirstDayOfMonth({ year, month, startWeekOnMonday })
    const emptyDays = dayOfWeek
    const rangeStartUnix = startDate
      ? dateToUnix(getStartOfDay(startDate))
      : undefined
    const rangeEndUnix = endDate ? dateToUnix(getEndOfDay(endDate)) : undefined

    return monthGrid(index, startWeekOnMonday, startYear, endYear).map(
      ({ days, weekGrid }) => {
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

            let inRange = false
            let disabled = isDisabled(day)
            let selected = false

            let leftCrop = dayOfMonth === 1
            let rightCrop = dayOfMonth === daysInMonth

            const isFirstDayOfMonth = dayOfMonth === 1
            const isLastDayOfMonth = dayOfMonth === daysInMonth

            if (mode === 'range') {
              const selectedStartDay = areDatesOnSameDay(day, startDate)
              const selectedEndDay = areDatesOnSameDay(day, endDate)
              selected = selectedStartDay || selectedEndDay
              const dayUnix = dateToUnix(day)
              inRange =
                rangeStartUnix !== undefined &&
                rangeEndUnix !== undefined &&
                dayUnix >= rangeStartUnix &&
                dayUnix <= rangeEndUnix
              if (selectedStartDay) {
                leftCrop = true
              }
              if (selectedEndDay) {
                rightCrop = true
              }
              if (dayIndex === 0 && !selectedStartDay) {
                leftCrop = false
              }

              if (dayIndex === 6 && !selectedEndDay) {
                rightCrop = false
              }

              if (
                (isFirstDayOfMonth && selectedEndDay) ||
                (isLastDayOfMonth && selectedStartDay)
              ) {
                inRange = false
              }
            } else if (mode === 'multiple') {
              const dayKey = calendarDayKey(year, month, dayOfMonth)
              selected = selectedKeys.has(dayKey)

              const yesterdaySelected = selectedKeys.has(
                adjacentDayKey(year, month, dayOfMonth, -1)
              )
              const tomorrowSelected = selectedKeys.has(
                adjacentDayKey(year, month, dayOfMonth, 1)
              )

              if (selected) {
                if (tomorrowSelected && yesterdaySelected) {
                  inRange = true
                }
                if (tomorrowSelected && !yesterdaySelected) {
                  inRange = true
                  leftCrop = true
                }

                if (yesterdaySelected && !tomorrowSelected) {
                  inRange = true
                  rightCrop = true
                }

                if (isFirstDayOfMonth && !tomorrowSelected) {
                  inRange = false
                }

                if (isLastDayOfMonth && !yesterdaySelected) {
                  inRange = false
                }

                if (inRange && !leftCrop && !rightCrop) {
                  selected = false
                }
              }
            } else if (mode === 'single') {
              selected = areDatesOnSameDay(day, date)
            }

            const isWithinOptionalValidRange = isWithinValidRange(day)

            if (inRange && !disabled) {
              disabled = false
            }

            if (!isWithinOptionalValidRange) {
              disabled = true
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
            }
          }),
        }
      }
    )
  }, [
    date,
    endDate,
    endYear,
    index,
    isDisabled,
    isWithinValidRange,
    mode,
    month,
    selectedKeys,
    startDate,
    startWeekOnMonday,
    startYear,
    year,
  ])

  const textFont = theme.fonts.titleSmall

  const iconColor = theme.colors.onSurfaceVariant

  const iconSource = selectingYear ? 'menu-up' : 'menu-down'

  const weeks = grid.map(({ weekIndex, generatedDays }) => (
    <View key={weekIndex} style={styles.week}>
      {generatedDays
        .filter((gd) => showWeekDay(gd.dayIndex, disableWeekDays))
        .map((gd) =>
          gd.beforeWeekDay || gd.afterWeekDay ? (
            <EmptyDay key={gd.dayIndex} />
          ) : (
            <Day
              day={gd.dayOfMonth}
              dayContent={dayContent}
              dayContentPosition={dayContentPosition}
              dayContentStyle={dayContentStyle}
              disabled={gd.disabled}
              inRange={gd.inRange}
              isToday={gd.isToday}
              key={gd.dayIndex}
              leftCrop={gd.leftCrop}
              month={gd.month}
              onPressDate={onPressDate}
              primaryColor={primaryColor}
              rightCrop={gd.rightCrop}
              selectColor={selectColor}
              selected={gd.selected}
              textColorOnPrimary={textColorOnPrimary}
              theme={theme}
              year={gd.year}
            />
          )
        )}
    </View>
  ))

  return (
    <View
      style={
        isHorizontal
          ? styles.monthFill
          : {
              height: getMonthHeight(
                scrollMode,
                index,
                startWeekOnMonday,
                startYear,
                endYear
              ),
            }
      }
    >
      <View
        style={[
          styles.monthHeader,
          isHorizontal
            ? {
                marginBottom: monthHeaderSingleMarginBottom,
                marginTop: monthHeaderSingleMarginTop,
              }
            : null,
        ]}
      >
        <TouchableRipple
          accessibilityLabel={`${monthName} ${year}`}
          accessibilityRole="button"
          disabled={!isHorizontal}
          onPress={isHorizontal ? () => onPressYear(year) : undefined}
          style={[
            styles.yearButton,
            {
              borderRadius: roundness,
            },
            alignTextToFirstWeekday(disableWeekDays),
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
              maxFontSizeMultiplier={1.5}
              selectable={false}
              style={[
                styles.monthLabel,
                {
                  ...textFont,
                  color: theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {monthName} {year}
            </Text>
            <View
              style={[
                styles.iconWrapper,
                isHorizontal ? sharedStyles.opacity1 : sharedStyles.opacity0,
              ]}
            >
              <Icon color={iconColor} size={24} source={iconSource} />
            </View>
          </View>
        </TouchableRipple>
      </View>
      {isHorizontal ? (
        <ScrollView
          alwaysBounceVertical={false}
          directionalLockEnabled
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          style={[
            sharedStyles.root,
            sharedStyles.minHeightZero,
            Platform.OS === 'web'
              ? ({ colorScheme: theme.dark ? 'dark' : 'light' } as ViewStyle)
              : null,
          ]}
          testID="react-native-paper-dates-month-days-scroll"
        >
          {weeks}
        </ScrollView>
      ) : (
        weeks
      )}
    </View>
  )
}

export const weekMargin = 6
export const weekSize = daySize + weekMargin
export const montHeaderHeight = 56
export const monthHeaderSingleMarginTop = 4
export const monthHeaderSingleMarginBottom = 8 + 44 + 12
export const monthHeaderSingleHeight =
  monthHeaderSingleMarginTop + monthHeaderSingleMarginBottom

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 8,
  },
  monthFill: {
    flex: 1,
    minHeight: 0,
  },
  monthHeader: {
    height: montHeaderHeight,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  monthLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  week: {
    flexDirection: 'row',
    height: daySize,
    marginBottom: weekMargin,
  },
  yearButton: {
    alignSelf: 'flex-start',
  },
  yearButtonInner: {
    alignItems: 'center',
    flexDirection: 'row',
  },
})

type VerticalLayout = {
  gridCount: number[]
  startAtIndex: number
  weekPrefix: number[]
}

const verticalLayoutCache = new Map<string, VerticalLayout>()

function getVerticalLayout(
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): VerticalLayout {
  const start = startYear ?? defaultStartYear
  const end = endYear ?? defaultEndYear
  const today = new Date()
  const key = `${start}:${end}:${startWeekOnMonday ? 1 : 0}:${today.getFullYear()}-${today.getMonth()}`
  const cached = verticalLayoutCache.get(key)
  if (cached) {
    return cached
  }

  const startAtIndex = getStartAtIndex(start, end)
  const total = getTotalMonths(start, end)
  const gridCount = new Array<number>(total)
  const weekPrefix = new Array<number>(total + 1)
  weekPrefix[0] = 0
  for (let i = 0; i < total; i += 1) {
    const count = getGridCount(i, startWeekOnMonday, start, end)
    gridCount[i] = count
    weekPrefix[i + 1] = weekPrefix[i] + count
  }
  const layout = { gridCount, startAtIndex, weekPrefix }
  verticalLayoutCache.set(key, layout)
  return layout
}

const monthGrid = (
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) => {
  const layout = getVerticalLayout(startWeekOnMonday, startYear, endYear)
  const weeks =
    layout.gridCount[index] ??
    getGridCount(index, startWeekOnMonday, startYear, endYear)
  return Array(weeks)
    .fill(null)
    .map((_, weekGrid) => {
      const days = Array(7).fill(null)
      return { weekGrid, days }
    })
}

function getIndexCount(
  index: number,
  startYear?: number,
  endYear?: number
): number {
  const dynamicStartAtIndex = getStartAtIndex(startYear, endYear)
  if (index > dynamicStartAtIndex) {
    return index - dynamicStartAtIndex
  }

  return -(dynamicStartAtIndex - index)
}

function weeksOffset(
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): number {
  const layout = getVerticalLayout(startWeekOnMonday, startYear, endYear)
  const max = layout.weekPrefix.length - 1
  const clamped = Math.max(0, Math.min(index, max))
  return layout.weekPrefix[clamped] - layout.weekPrefix[layout.startAtIndex]
}

export function getHorizontalMonthOffset(index: number, width: number) {
  if (index < 0) {
    return 0
  }
  return width * index
}

export function getIndexFromHorizontalOffset(
  offset: number,
  width: number,
  startYear?: number,
  endYear?: number
): number {
  const dynamicStartAtIndex = getStartAtIndex(startYear, endYear)
  return dynamicStartAtIndex + Math.floor(offset / width)
}

export function getIndexFromVerticalOffset(
  offset: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): number {
  const dynamicStartAtIndex = getStartAtIndex(startYear, endYear)
  const dynamicBeginOffset = estimatedMonthHeight * dynamicStartAtIndex
  let estimatedIndex =
    dynamicStartAtIndex + Math.ceil(offset / estimatedMonthHeight)

  const realOffset = getVerticalMonthsOffset(
    estimatedIndex,
    startWeekOnMonday,
    startYear,
    endYear
  )
  const difference =
    (realOffset - dynamicBeginOffset - offset) / estimatedMonthHeight
  if (difference >= 1 || difference <= -1) {
    estimatedIndex -= Math.floor(difference)
  }
  return estimatedIndex
}

export function getLocalMonthOffset(
  visibleIndexes: number[],
  monthIndex: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): number {
  let offset = 0
  for (const visibleIndex of visibleIndexes) {
    if (visibleIndex === monthIndex) {
      return offset
    }
    offset += getMonthHeight(
      'vertical',
      visibleIndex,
      startWeekOnMonday,
      startYear,
      endYear
    )
  }
  return offset
}

export function getMonthHeight(
  scrollMode: 'horizontal' | 'vertical',
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): number {
  const calendarHeight = getCalendarHeaderHeight(scrollMode)
  const layout = getVerticalLayout(startWeekOnMonday, startYear, endYear)
  const gc =
    layout.gridCount[index] ??
    getGridCount(index, startWeekOnMonday, startYear, endYear)

  const currentMonthHeight = weekSize * gc
  const extraHeight =
    scrollMode === 'horizontal' ? monthHeaderSingleHeight : montHeaderHeight
  return calendarHeight + currentMonthHeight + extraHeight
}

export function getVerticalMonthsOffset(
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) {
  const count = getIndexCount(index, startYear, endYear)
  const ob = weeksOffset(index, startWeekOnMonday, startYear, endYear)
  const monthsHeight = weekSize * ob
  const c = monthsHeight + count * (dayNamesHeight + montHeaderHeight)
  const dynamicBeginOffset =
    estimatedMonthHeight * getStartAtIndex(startYear, endYear)

  return c + dynamicBeginOffset
}

export function getVisibleMonthsHeight(
  visibleIndexes: number[],
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): number {
  return visibleIndexes.reduce(
    (sum, visibleIndex) =>
      sum +
      getMonthHeight(
        'vertical',
        visibleIndex,
        startWeekOnMonday,
        startYear,
        endYear
      ),
    0
  )
}

export default memo(Month)
