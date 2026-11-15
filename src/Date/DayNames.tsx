import { StyleSheet, View } from 'react-native'
import DayName from './DayName'
import { useTheme } from 'react-native-paper'
import { showWeekDay } from './dateUtils'
import type { DisableWeekDaysType } from './types'
import { memo, useMemo } from 'react'

function DayNames({
  backgroundColor,
  disableWeekDays,
  height = dayNamesHeight,
  locale,
  startWeekOnMonday,
}: {
  backgroundColor?: string
  disableWeekDays?: DisableWeekDaysType
  height?: number
  locale: string | undefined
  startWeekOnMonday: boolean
}) {
  const shortDayNames = useMemo<string[]>(() => {
    const weekdays = [
      new Date(2020, 7, 2),
      new Date(2020, 7, 3),
      new Date(2020, 7, 4),
      new Date(2020, 7, 5),
      new Date(2020, 7, 6),
      new Date(2020, 7, 7),
      new Date(2020, 7, 8),
    ]
    if (startWeekOnMonday) {
      weekdays.push(weekdays.shift() as Date)
    }
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: 'narrow',
    })
    return weekdays.map((date) => formatter.format(date))
  }, [locale, startWeekOnMonday])

  const theme = useTheme()

  return (
    <View
      pointerEvents="none"
      style={[
        styles.dayNames,
        {
          backgroundColor: backgroundColor ?? theme.colors.elevation.level3,
        },
        ...(height === dayNamesHeight ? [] : [{ height }]),
      ]}
    >
      {shortDayNames
        .filter((_, dayIndex) => showWeekDay(dayIndex, disableWeekDays))
        .map((dayName, i) => (
          <DayName key={`${dayName}_${i}`} label={dayName} />
        ))}
    </View>
  )
}

export const dayNamesHeight = 48

const styles = StyleSheet.create({
  dayNames: {
    alignItems: 'center',
    flexDirection: 'row',
    height: dayNamesHeight,
  },
})
export default memo(DayNames)
