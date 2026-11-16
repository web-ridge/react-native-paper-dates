import { memo, useCallback, useMemo, useState } from 'react'
import {
  type LayoutChangeEvent,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native'
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper'

import { sharedStyles } from '../shared/styles'
import { useTextColorOnPrimary } from '../shared/utils'
import {
  addMonths,
  areDatesOnSameDay,
  calendarDateKey,
  dayCellSize,
  getDaysInMonth,
  getFirstDayOfMonth,
  getRealIndex,
  showWeekDay,
} from './dateUtils'
import Day, { EmptyDay } from './Day'
import { useRangeChecker } from './inputFormat'
import {
  getMonthHeight,
  horizontalWeekHeight,
  monthHeaderHeight,
  monthHeaderSingleMarginBottom,
  monthHeaderSingleMarginTop,
  monthWeekCount,
  weekMargin,
} from './monthLayout'
import { dayMarks, rangeBounds } from './selection'
import type {
  CalendarDate,
  CalendarDates,
  CalendarMode,
  DayContentPosition,
  DayContentRenderer,
  DisableWeekDaysType,
  ModeType,
  ValidRangeType,
} from './types'
import { alignTextToFirstWeekday } from './weekdayColumns'

interface BaseMonthProps {
  date?: CalendarDate
  dates?: CalendarDates
  dayContent?: DayContentRenderer
  dayContentPosition?: DayContentPosition
  dayContentStyle?: StyleProp<ViewStyle>
  disableWeekDays?: DisableWeekDaysType
  endDate?: CalendarDate
  endYear?: number
  focusedDate?: CalendarDate
  hideHeader?: boolean
  index: number
  locale: string | undefined
  mode: ModeType
  onNavigateToDate?: (date: Date) => void
  onPressDate: (date: Date) => void
  onPressYear: (year: number) => void
  primaryColor: string
  roundness: number
  scrollMode: 'horizontal' | 'vertical'
  selectColor: string
  selectingYear: boolean
  showOutsideDays?: boolean
  startDate?: CalendarDate
  startWeekOnMonday: boolean
  startYear?: number
  validRange?: ValidRangeType
}
const menuButtonInset = 8
const monthNameFormatters = new Map<string, Intl.DateTimeFormat>()

function Month(props: BaseMonthProps & CalendarMode) {
  const {
    date,
    dates,
    dayContent,
    dayContentPosition,
    dayContentStyle,
    disableWeekDays,
    endDate,
    endYear,
    focusedDate,
    hideHeader,
    index,
    locale,
    mode,
    onNavigateToDate,
    onPressDate,
    onPressYear,
    primaryColor,
    roundness,
    scrollMode,
    selectColor,
    selectingYear,
    showOutsideDays,
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
    const md = addMonths(new Date(), realIndex)
    return {
      month: md.getMonth(),
      monthName: monthTitle(md, locale),
      year: md.getFullYear(),
    }
  }, [locale, realIndex])
  const onDayPress = useCallback(
    (pressed: Date) => {
      onPressDate(pressed)
      if (pressed.getFullYear() !== year || pressed.getMonth() !== month) {
        onNavigateToDate?.(pressed)
      }
    },
    [month, onNavigateToDate, onPressDate, year]
  )
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
    const range = mode === 'range' ? rangeBounds(startDate, endDate) : undefined
    const today = new Date()

    return monthGrid(index, startWeekOnMonday, startYear, endYear).map(
      ({ days, weekGrid }) => {
        return {
          generatedDays: days.map((_, dayIndex) => {
            const dayOfMonth = weekGrid * 7 + dayIndex - emptyDays + 1
            const afterWeekDay = dayOfMonth > daysInMonth
            const day = new Date(year, month, dayOfMonth)
            let disabled = isDisabled(day)
            const isFirstWeek = weekGrid === 0
            const isToday = areDatesOnSameDay(day, today)
            const realDayIndex = emptyDays - dayIndex
            const beforeWeekDay = isFirstWeek && realDayIndex > 0
            const { inRange, leftCrop, rightCrop, selected } = dayMarks({
              date,
              day,
              dayIndex,
              dayOfMonth,
              daysInMonth,
              endDate,
              mode,
              month,
              range,
              selectedKeys,
              startDate,
              year,
            })

            if (!isWithinValidRange(day)) {
              disabled = true
            }

            return {
              afterWeekDay,
              beforeWeekDay,
              dayIndex,
              dayOfMonth: day.getDate(),
              disabled,
              focused: !!focusedDate && areDatesOnSameDay(day, focusedDate),
              inRange,
              isToday,
              leftCrop,
              mode,
              month: day.getMonth(),
              outside: beforeWeekDay || afterWeekDay,
              rightCrop,
              selected,
              year: day.getFullYear(),
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
    focusedDate,
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

  const renderOutsideDays = showOutsideDays ?? isHorizontal
  const weekCount = Math.max(grid.length, 1)
  const naturalDaysHeight = weekCount * dayCellSize
  const [daysHeight, setDaysHeight] = useState(0)
  const rowHeight = horizontalWeekHeight(daysHeight, weekCount)
  const onDaysLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height
    setDaysHeight((current) =>
      Math.abs(current - next) < 0.5 ? current : next
    )
  }

  const weeks = grid.map(({ generatedDays, weekIndex }) => (
    <View
      key={weekIndex}
      style={[styles.week, isHorizontal ? { height: rowHeight } : null]}
    >
      {generatedDays
        .filter((gd) => showWeekDay(gd.dayIndex, disableWeekDays))
        .map((gd) =>
          gd.outside && !renderOutsideDays ? (
            <EmptyDay key={gd.dayIndex} />
          ) : (
            <Day
              key={gd.dayIndex}
              cellHeight={isHorizontal ? rowHeight : undefined}
              day={gd.dayOfMonth}
              dayContent={dayContent}
              dayContentPosition={dayContentPosition}
              dayContentStyle={dayContentStyle}
              disabled={gd.disabled}
              focused={gd.focused}
              inRange={gd.inRange}
              isToday={gd.isToday}
              leftCrop={gd.leftCrop}
              locale={locale}
              month={gd.month}
              onPressDate={onDayPress}
              outside={gd.outside}
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
        hideHeader
          ? undefined
          : isHorizontal
            ? sharedStyles.hug
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
      {hideHeader ? null : (
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
            accessibilityHint="Shift+Y"
            accessibilityLabel={`${monthName} ${year}`}
            accessibilityRole="button"
            disabled={!isHorizontal}
            onPress={isHorizontal ? () => onPressYear(year) : undefined}
            style={[
              styles.yearButton,
              {
                borderRadius: roundness,
                paddingStart: menuButtonInset,
              },
              alignTextToFirstWeekday(disableWeekDays, menuButtonInset),
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
                numberOfLines={1}
                selectable={false}
                style={[
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
                <Icon color={iconColor} size={18} source={iconSource} />
              </View>
            </View>
          </TouchableRipple>
        </View>
      )}
      {hideHeader ? (
        <View>{weeks}</View>
      ) : isHorizontal ? (
        <View
          onLayout={onDaysLayout}
          style={[
            styles.days,
            { flexBasis: naturalDaysHeight, maxHeight: naturalDaysHeight },
          ]}
          testID="react-native-paper-dates-month-days-scroll"
        >
          {weeks}
        </View>
      ) : (
        weeks
      )}
    </View>
  )
}

const monthGrid = (
  index: number,
  startWeekOnMonday: boolean,
  startYear?: number,
  endYear?: number
) => {
  const weeks = monthWeekCount(index, startWeekOnMonday, startYear, endYear)
  return Array(weeks)
    .fill(null)
    .map((_, weekGrid) => {
      const days = Array(7).fill(null)
      return { days, weekGrid }
    })
}

function monthTitle(date: Date, locale: string | undefined) {
  const key = locale === undefined ? '\0' : locale
  let formatter = monthNameFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { month: 'long' })
    monthNameFormatters.set(key, formatter)
  }
  return formatter.format(date)
}

const styles = StyleSheet.create({
  days: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
  },
  iconWrapper: {
    padding: 8,
  },
  monthHeader: {
    height: monthHeaderHeight,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  week: {
    flexDirection: 'row',
    height: dayCellSize,
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

export default memo(Month)
