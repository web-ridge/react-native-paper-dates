import { memo, useCallback, useMemo, useState } from 'react'
import {
  type LayoutChangeEvent,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native'
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper'

import { formatMonth } from '../shared/intl'
import { sharedStyles } from '../shared/styles'
import { useTextColorOnPrimary } from '../shared/utils'
import {
  calendarDateKey,
  calendarDayKey,
  calendarOrdinal,
  currentCalendarDay,
  currentCalendarMonth,
  dateOrdinal,
  dayCellSize,
  getDaysInMonth,
  getFirstDayOfMonth,
  getRealIndex,
  resolveCalendarDay,
  shiftMonth,
  showWeekDay,
} from './dateUtils'
import Day, { EmptyDay } from './Day'
import { useRangeChecker } from './inputFormat'
import { calendarArrowSize, calendarControlInset } from './CalendarHeader'
import {
  getMonthHeight,
  horizontalWeekHeight,
  monthHeaderHeight,
  monthHeaderSingleMarginBottom,
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
  indicatorSize?: number
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
type MonthDayProps = CalendarMode &
  Omit<BaseMonthProps, 'onPressYear' | 'roundness' | 'selectingYear'> & {
    month: number
    year: number
  }

function MonthDays({
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
  indicatorSize,
  locale,
  mode,
  month,
  onNavigateToDate,
  onPressDate,
  scrollMode,
  selectColor,
  showOutsideDays,
  startDate,
  startWeekOnMonday,
  startYear,
  validRange,
  year,
  primaryColor,
}: MonthDayProps) {
  const { disabledKeys, validEnd, validStart } = useRangeChecker(validRange)
  const isHorizontal = scrollMode === 'horizontal'
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
  const today = currentCalendarDay()
  const todayDay = today.day
  const todayMonth = today.month
  const todayYear = today.year
  const dayOfWeek = getFirstDayOfMonth({ month, startWeekOnMonday, year })
  const daysInMonth = getDaysInMonth({ month, year })
  const range = mode === 'range' ? rangeBounds(startDate, endDate) : undefined
  const validEndOrdinal = validEnd ? dateOrdinal(validEnd) : undefined
  const validStartOrdinal = validStart ? dateOrdinal(validStart) : undefined
  const textColorOnPrimary = useTextColorOnPrimary()
  const theme = useTheme()
  const renderOutsideDays = showOutsideDays ?? isHorizontal
  const weeksInMonth = Math.max(
    monthWeekCount(index, startWeekOnMonday, startYear, endYear),
    1
  )
  const naturalDaysHeight = weeksInMonth * dayCellSize
  const [daysHeight, setDaysHeight] = useState(0)
  const rowHeight = horizontalWeekHeight(daysHeight, weeksInMonth)
  const onDaysLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height
    setDaysHeight((current) =>
      Math.abs(current - next) < 0.5 ? current : next
    )
  }, [])
  const weeks = []
  for (let weekGrid = 0; weekGrid < weeksInMonth; weekGrid += 1) {
    const cells = []
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      if (!showWeekDay(dayIndex, disableWeekDays)) continue
      const dayOfMonth = weekGrid * 7 + dayIndex - dayOfWeek + 1
      const outside = dayOfMonth < 1 || dayOfMonth > daysInMonth
      if (outside && !renderOutsideDays) {
        cells.push(<EmptyDay key={dayIndex} />)
        continue
      }
      const resolved = outside
        ? resolveCalendarDay(year, month, dayOfMonth)
        : undefined
      const cellDay = resolved?.day ?? dayOfMonth
      const cellMonth = resolved?.month ?? month
      const cellYear = resolved?.year ?? year
      let disabled = disabledKeys.has(
        calendarDayKey(cellYear, cellMonth, cellDay)
      )
      const ordinal = calendarOrdinal(cellYear, cellMonth, cellDay)
      if (
        (validStartOrdinal !== undefined && ordinal < validStartOrdinal) ||
        (validEndOrdinal !== undefined && ordinal > validEndOrdinal)
      ) {
        disabled = true
      }
      const marks = dayMarks({
        cellDay,
        cellMonth,
        cellYear,
        date,
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
      cells.push(
        <Day
          key={dayIndex}
          cellHeight={isHorizontal ? rowHeight : undefined}
          day={cellDay}
          dayContent={dayContent}
          dayContentPosition={dayContentPosition}
          dayContentStyle={dayContentStyle}
          disabled={disabled}
          focused={
            !!focusedDate &&
            focusedDate.getFullYear() === cellYear &&
            focusedDate.getMonth() === cellMonth &&
            focusedDate.getDate() === cellDay
          }
          inRange={marks.inRange}
          indicatorSize={indicatorSize}
          isToday={
            cellYear === todayYear &&
            cellMonth === todayMonth &&
            cellDay === todayDay
          }
          leftCrop={marks.leftCrop}
          locale={locale}
          month={cellMonth}
          onPressDate={onDayPress}
          outside={outside}
          primaryColor={primaryColor}
          rightCrop={marks.rightCrop}
          selectColor={selectColor}
          selected={marks.selected}
          textColorOnPrimary={textColorOnPrimary}
          theme={theme}
          year={cellYear}
        />
      )
    }
    weeks.push(
      <View
        key={weekGrid}
        role="row"
        style={[styles.week, isHorizontal ? { height: rowHeight } : null]}
      >
        {cells}
      </View>
    )
  }

  return (
    <View
      accessibilityRole={hideHeader ? undefined : 'grid'}
      onLayout={isHorizontal ? onDaysLayout : undefined}
      role={hideHeader ? undefined : 'grid'}
      style={
        isHorizontal
          ? [
              styles.days,
              {
                flexBasis: naturalDaysHeight,
                maxHeight: naturalDaysHeight,
              },
            ]
          : undefined
      }
      testID={
        isHorizontal ? 'react-native-paper-dates-month-days-scroll' : undefined
      }
    >
      {weeks}
    </View>
  )
}

const MonthGrid = memo(MonthDays)

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
    indicatorSize,
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
  const isHorizontal = scrollMode === 'horizontal'
  const realIndex = getRealIndex(index, startYear, endYear)
  const current = currentCalendarMonth()
  const { month, year } = shiftMonth(current.year, current.month, realIndex)
  const monthName = formatMonth(locale, month)
  const theme = useTheme()
  const iconColor = theme.colors.onSurfaceVariant
  const textFont = theme.fonts.titleSmall

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
                  height: calendarArrowSize,
                  marginBottom: monthHeaderSingleMarginBottom,
                  marginTop: calendarControlInset,
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
      <MonthGrid
        date={date}
        dates={dates}
        dayContent={dayContent}
        dayContentPosition={dayContentPosition}
        dayContentStyle={dayContentStyle}
        disableWeekDays={disableWeekDays}
        endDate={endDate}
        endYear={endYear}
        focusedDate={focusedDate}
        hideHeader={hideHeader}
        index={index}
        indicatorSize={indicatorSize}
        locale={locale}
        mode={mode}
        month={month}
        onNavigateToDate={onNavigateToDate}
        onPressDate={onPressDate}
        primaryColor={primaryColor}
        scrollMode={scrollMode}
        selectColor={selectColor}
        showOutsideDays={showOutsideDays}
        startDate={startDate}
        startWeekOnMonday={startWeekOnMonday}
        startYear={startYear}
        validRange={validRange}
        year={year}
      />
    </View>
  )
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
    height: 40,
    justifyContent: 'center',
  },
  yearButtonInner: {
    alignItems: 'center',
    flexDirection: 'row',
  },
})

export default memo(Month)
