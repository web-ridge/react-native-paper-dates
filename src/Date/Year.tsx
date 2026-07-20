import { StyleSheet, View } from 'react-native'
import {
  Icon,
  MD2Theme,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper'
import Mon from './Mon'

import {
  addMonths,
  areDatesInSameMonth,
  daySize,
  estimatedMonthHeight,
  getGridCount,
  getRealIndex,
  getStartAtIndex,
  getTotalMonths,
  createGridCounts,
  DisableWeekDaysType,
  useRangeChecker,
} from './dateUtils'
import { getCalendarHeaderHeight } from './CalendarHeader'
import type {
  CalendarDate,
  CalendarDates,
  ModeType,
  ValidRangeType,
} from './Calendar'
import { dayNamesHeight } from './DayNames'
import { useTextColorOnPrimary } from '../shared/utils'
import { memo, useMemo } from 'react'
import { sharedStyles } from '../shared/styles'

interface BaseYearProps {
  locale: undefined | string
  scrollMode: 'horizontal' | 'vertical'
  disableWeekDays?: DisableWeekDaysType
  mode: ModeType
  index: number
  onPressYear: (year: number) => any
  selectingYear: boolean
  onPressDate: (date: Date) => any
  primaryColor: string
  selectColor: string
  roundness: number
  validRange?: ValidRangeType
  startWeekOnMonday: boolean
  startYear?: number
  endYear?: number
  // some of these should be required in final implementation
  startDate?: CalendarDate
  endDate?: CalendarDate
  date?: CalendarDate
  dates?: CalendarDates
}

interface YearMonthProps extends BaseYearProps {
  mode: 'month'
  date: CalendarDate
}

function Year(props: YearMonthProps ) {
  const {
    locale,
    mode,
    index,
    onPressYear,
    selectingYear,
    onPressDate,
    primaryColor,
    selectColor,
    roundness,
    validRange,
    scrollMode,
    startDate,
    endDate,
    date,
    dates,
    startWeekOnMonday,
    startYear,
    endYear,
  } = props
  const isHorizontal = scrollMode === 'horizontal'

  const theme = useTheme()
  const textColorOnPrimary = useTextColorOnPrimary()
  const realIndex = getRealIndex(index, startYear, endYear)
  const { isDisabled, isWithinValidRange } = useRangeChecker(validRange)

  const { month, year } = useMemo(() => {
    const md = addMonths(new Date(), realIndex)
    const y = md.getFullYear()
    const m = md.getMonth()
    return { month: m, year: y }
  }, [realIndex])

  const grid = useMemo(() => {
    const today = new Date()

    const formatter = new Intl.DateTimeFormat(locale, {
      month: 'short',
    })

    return yearGrid().map(
      ({ months, monthGrid }) => {
        return {
          monthIndex: monthGrid,
          generatedMonths: months.map((_, index) => {
            const monthOfYear = monthGrid * 3 + index

            const day = new Date(year, monthOfYear, 1)
            const thisMonth = areDatesInSameMonth(day, today)

            const monthLabel = formatter.format(day)

            let inRange = false
            let disabled = isDisabled(day)
            let selected = false

            let leftCrop = monthOfYear === 1
            let rightCrop = monthOfYear === 12

            selected = areDatesInSameMonth(day, date)

            const isWithinOptionalValidRange = isWithinValidRange(day)

            if (inRange && !disabled) {
              disabled = false
            }

            if (!isWithinOptionalValidRange) {
              disabled = true
            }

            return {
              year,
              monthOfYear,
              monthLabel,
              index,
              mode,
              selected,
              inRange,
              leftCrop,
              rightCrop,
              thisMonth,
              disabled,
            }
          }),
        }
      }
    )
  }, [
    year,
    month,
    index,
    isDisabled,
    mode,
    isWithinValidRange,
    startDate,
    endDate,
    dates,
    date,
    startWeekOnMonday,
    startYear,
    endYear,
    locale,
  ])

  let textFont = theme?.isV3
    ? theme.fonts.titleSmall
    : (theme as any as MD2Theme).fonts.medium

  const iconColor = theme.isV3
    ? theme.colors.onSurfaceVariant
    : theme.colors.onSurface

  const iconSourceV3 = selectingYear ? 'menu-up' : 'menu-down'
  const iconSourceV2 = selectingYear ? 'chevron-up' : 'chevron-down'
  const iconSource = theme.isV3 ? iconSourceV3 : iconSourceV2

  return (
    <View
      style={{
        height: getMonthHeight(
          scrollMode,
          index,
          startWeekOnMonday,
          startYear,
          endYear
        ),
      }}
    >
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
          accessibilityRole="button"
          accessibilityLabel={`${year}`}
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
              maxFontSizeMultiplier={1.5}
              style={[
                styles.monthLabel,
                {
                  ...textFont,
                  color: theme.isV3
                    ? theme.colors.onSurfaceVariant
                    : theme.colors.onSurface,
                },
              ]}
              selectable={false}
            >
              {year}
            </Text>
            <View
              style={[
                styles.iconWrapper,
                isHorizontal ? sharedStyles.opacity1 : sharedStyles.opacity0,
              ]}
            >
              <Icon size={24} color={iconColor} source={iconSource} />
            </View>
          </View>
        </TouchableRipple>
      </View>
      {grid.map(({ monthIndex, generatedMonths }) => (
        <View style={styles.month} key={monthIndex}>
          {generatedMonths
            .map((gd) => (
                <Mon
                  key={gd.index}
                  theme={theme}
                  month={gd.monthOfYear}
                  label={gd.monthLabel}
                  year={gd.year}
                  selected={gd.selected}
                  inRange={gd.inRange}
                  leftCrop={gd.leftCrop}
                  rightCrop={gd.rightCrop}
                  onPressDate={onPressDate}
                  thisMonth={gd.thisMonth}
                  selectColor={selectColor}
                  primaryColor={primaryColor}
                  disabled={gd.disabled}
                  textColorOnPrimary={textColorOnPrimary}
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
export const montHeaderHeight = 56
export const monthHeaderSingleMarginTop = 4
export const monthHeaderSingleMarginBottom = 8 + 44 + 12
export const monthHeaderSingleHeight =
  monthHeaderSingleMarginTop + monthHeaderSingleMarginBottom

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 8,
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
  month: {
    flexDirection: 'row',
    marginBottom: weekMargin,
    height: daySize,
  },
  yearButton: {
    alignSelf: 'flex-start',
    marginLeft: 6,
  },
  yearButtonInner: {
    paddingLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
})

const yearGrid = () => {
  return Array(4)
    .fill(null)
    .map((_, monthGrid) => {
      const months = Array(3).fill(null)
      return { monthGrid, months }
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
  const dynamicStartAtIndex = getStartAtIndex(startYear, endYear)
  const dynamicGridCounts = createGridCounts(getTotalMonths(startYear, endYear))

  if (index === dynamicStartAtIndex) {
    return 0
  }
  let off = 0
  if (index > dynamicStartAtIndex) {
    for (let i = 0; i < index - dynamicStartAtIndex; i++) {
      const cIndex = dynamicStartAtIndex + i
      off +=
        dynamicGridCounts[cIndex] ||
        getGridCount(cIndex, startWeekOnMonday, startYear, endYear)
    }
  } else {
    for (let i = 0; i < dynamicStartAtIndex - index; i++) {
      const cIndex = dynamicStartAtIndex - i - 1
      off -=
        dynamicGridCounts[cIndex] ||
        getGridCount(cIndex, startWeekOnMonday, startYear, endYear)
    }
  }
  return off
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

export function getHorizontalMonthOffset(index: number, width: number) {
  if (index < 0) {
    return 0
  }
  return width * index
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

  return (c || 0) + dynamicBeginOffset
}

export function getMonthHeight(
  scrollMode: 'horizontal' | 'vertical',
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
): number {
  const calendarHeight = getCalendarHeaderHeight(scrollMode)
  const gc = getGridCount(index, startWeekOnMonday, startYear, endYear)

  const currentMonthHeight = weekSize * gc
  const extraHeight =
    scrollMode === 'horizontal' ? monthHeaderSingleHeight : montHeaderHeight
  const c = calendarHeight + currentMonthHeight + extraHeight
  return c || 0
}

export default memo(Year)
