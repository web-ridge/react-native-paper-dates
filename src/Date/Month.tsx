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
  DisableWeekDaysType,
  ModeType,
  ValidRangeType,
} from './types'
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
  locale: string | undefined
  mode: ModeType
  onPressDate: (date: Date) => void
  onPressYear: (year: number) => void
  primaryColor: string
  roundness: number
  scrollMode: 'horizontal' | 'vertical'
  selectColor: string
  selectingYear: boolean
  startDate?: CalendarDate
  startWeekOnMonday: boolean
  startYear?: number
  validRange?: ValidRangeType
}

export function getHorizontalMonthOffset(index: number, width: number) {
  if (index < 0) {
    return 0
  }
  return width * index
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
  const extraHeight =
    scrollMode === 'horizontal' ? monthHeaderSingleHeight : monthHeaderHeight
  const layout = getVerticalLayout(startWeekOnMonday, startYear, endYear)
  const gc =
    layout.gridCount[index] ??
    getGridCount(index, startWeekOnMonday, startYear, endYear)
  const currentMonthHeight = weekSize * gc
  return calendarHeight + currentMonthHeight + extraHeight
}

function getVerticalLayout(
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): VerticalLayout {
  const end = endYear ?? defaultEndYear
  const start = startYear ?? defaultStartYear
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

export function getVerticalListMetrics(
  minIndex: number,
  maxIndex: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) {
  const end =
    getVerticalMonthsOffset(maxIndex, startWeekOnMonday, startYear, endYear) +
    getMonthHeight('vertical', maxIndex, startWeekOnMonday, startYear, endYear)
  const origin = getVerticalMonthsOffset(
    minIndex,
    startWeekOnMonday,
    startYear,
    endYear
  )
  return {
    height: Math.max(end - origin, 1),
    origin,
  }
}

export function getVerticalMonthScrollY(
  index: number,
  origin: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) {
  return Math.max(
    0,
    getVerticalMonthsOffset(index, startWeekOnMonday, startYear, endYear) -
      origin -
      monthHeaderHeight
  )
}

export function getVerticalMonthsOffset(
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) {
  const count = getIndexCount(index, startYear, endYear)
  const dynamicBeginOffset =
    estimatedMonthHeight * getStartAtIndex(startYear, endYear)
  const ob = weeksOffset(index, startWeekOnMonday, startYear, endYear)
  const monthsHeight = weekSize * ob
  const c = monthsHeight + count * (dayNamesHeight + monthHeaderHeight)

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

export function horizontalMonthScrolls(
  viewportHeight: number,
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): boolean {
  const layout = getVerticalLayout(startWeekOnMonday, startYear, endYear)
  const weeks =
    layout.gridCount[index] ??
    getGridCount(index, startWeekOnMonday, startYear, endYear)
  return weekSize * weeks > viewportHeight - horizontalMonthChrome
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

  const iconSource = selectingYear ? 'menu-up' : 'menu-down'

  const { isDisabled, isWithinValidRange } = useRangeChecker(validRange)

  const isHorizontal = scrollMode === 'horizontal'

  const realIndex = getRealIndex(index, startYear, endYear)

  const { month, monthName, year } = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, {
      month: 'long',
    })
    const md = addMonths(new Date(), realIndex)
    const m = md.getMonth()
    const y = md.getFullYear()
    return { month: m, monthName: formatter.format(md), year: y }
  }, [realIndex, locale])

  const selectedKeys = useMemo(() => {
    const keys = new Set<string>()
    if (dates) {
      for (const selected of dates) {
        keys.add(calendarDateKey(selected))
      }
    }
    return keys
  }, [dates])

  const grid = useMemo(() => {
    const dayOfWeek = getFirstDayOfMonth({ month, startWeekOnMonday, year })
    const daysInMonth = getDaysInMonth({ month, year })
    const emptyDays = dayOfWeek
    const rangeEndUnix = endDate ? dateToUnix(getEndOfDay(endDate)) : undefined
    const rangeStartUnix = startDate
      ? dateToUnix(getStartOfDay(startDate))
      : undefined
    const today = new Date()

    return monthGrid(index, startWeekOnMonday, startYear, endYear).map(
      ({ days, weekGrid }) => {
        return {
          generatedDays: days.map((_, dayIndex) => {
            const dayOfMonth = weekGrid * 7 + dayIndex - emptyDays + 1
            const afterWeekDay = dayOfMonth > daysInMonth
            const day = new Date(year, month, dayOfMonth)
            let disabled = isDisabled(day)
            let inRange = false
            const isFirstDayOfMonth = dayOfMonth === 1
            const isFirstWeek = weekGrid === 0
            const isLastDayOfMonth = dayOfMonth === daysInMonth
            const isToday = areDatesOnSameDay(day, today)
            let leftCrop = dayOfMonth === 1
            const realDayIndex = emptyDays - dayIndex
            const beforeWeekDay = isFirstWeek && realDayIndex > 0
            let rightCrop = dayOfMonth === daysInMonth
            let selected = false

            if (mode === 'range') {
              const selectedEndDay = areDatesOnSameDay(day, endDate)
              const selectedStartDay = areDatesOnSameDay(day, startDate)
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

              const tomorrowSelected = selectedKeys.has(
                adjacentDayKey(year, month, dayOfMonth, 1)
              )
              const yesterdaySelected = selectedKeys.has(
                adjacentDayKey(year, month, dayOfMonth, -1)
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
              afterWeekDay,
              beforeWeekDay,
              dayIndex,
              dayOfMonth,
              disabled,
              inRange,
              isToday,
              leftCrop,
              mode,
              month,
              rightCrop,
              selected,
              year,
            }
          }),
          weekIndex: weekGrid,
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

  const textColorOnPrimary = useTextColorOnPrimary()

  const theme = useTheme()

  const iconColor = theme.colors.onSurfaceVariant

  const textFont = theme.fonts.titleSmall

  const weeks = grid.map(({ generatedDays, weekIndex }) => (
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
              locale={locale}
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

export const monthHeaderHeight = 56

export const monthHeaderSingleMarginBottom = 8 + 44 + 12

export const monthHeaderSingleMarginTop = 4

const horizontalMonthChrome =
  monthHeaderSingleMarginTop + monthHeaderHeight + monthHeaderSingleMarginBottom

export const monthHeaderSingleHeight =
  monthHeaderSingleMarginTop + monthHeaderSingleMarginBottom

interface MonthMultiProps extends BaseMonthProps {
  dates: CalendarDates
  mode: 'multiple'
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

type VerticalLayout = {
  gridCount: number[]
  startAtIndex: number
  weekPrefix: number[]
}

const verticalLayoutCache = new Map<string, VerticalLayout>()

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
      return { days, weekGrid }
    })
}

export const weekMargin = 6

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 8,
  },
  monthFill: {
    flex: 1,
    minHeight: 0,
  },
  monthHeader: {
    height: monthHeaderHeight,
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

export const weekSize = daySize + weekMargin

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

export default memo(Month)
