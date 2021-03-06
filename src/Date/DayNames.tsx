import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import DayName from './DayName'
import { useTheme } from 'react-native-paper'
import { DisableWeekDaysType, showWeekDay } from './dateUtils'

export const dayNamesHeight = 44

// TODO: wait for a better Intl api ;-)
const weekdays = [
  new Date(2020, 7, 2),
  new Date(2020, 7, 3),
  new Date(2020, 7, 4),
  new Date(2020, 7, 5),
  new Date(2020, 7, 6),
  new Date(2020, 7, 7),
  new Date(2020, 7, 8),
]

function DayNames({
  disableWeekDays,
  locale,
}: {
  locale: undefined | string
  disableWeekDays?: DisableWeekDaysType
}) {
  const theme = useTheme()
  const shortDayNames = React.useMemo<string[]>(() => {
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: 'narrow',
    })
    return weekdays.map((date) => formatter.format(date))
  }, [locale])

  return (
    <View
      style={[styles.dayNames, { backgroundColor: theme.colors.surface }]}
      pointerEvents={'none'}
    >
      {shortDayNames
        .filter((_, dayIndex) => showWeekDay(dayIndex, disableWeekDays))
        .map((dayName, i) => (
          <DayName key={`${dayName}_${i}`} label={dayName} />
        ))}
    </View>
  )
}
const styles = StyleSheet.create({
  dayNames: {
    height: dayNamesHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
})
export default React.memo(DayNames)
