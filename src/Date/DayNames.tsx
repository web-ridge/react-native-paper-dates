import { memo, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { dateTimeFormat } from '../shared/intl'
import { showWeekDay } from './dateUtils'
import DayName from './DayName'
import type { DisableWeekDaysType } from './types'

export const dayNamesHeight = 48

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
  const dayNames = useMemo(() => {
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
    const narrow = dateTimeFormat(locale, { weekday: 'narrow' })
    const long = dateTimeFormat(locale, { weekday: 'long' })
    return weekdays.map((date) => ({
      label: narrow.format(date),
      name: long.format(date),
    }))
  }, [locale, startWeekOnMonday])
  const theme = useTheme()

  return (
    <View
      pointerEvents="box-none"
      role="row"
      style={[
        styles.dayNames,
        {
          backgroundColor: backgroundColor ?? theme.colors.surfaceContainerHigh,
        },
        ...(height === dayNamesHeight ? [] : [{ height }]),
      ]}
    >
      {dayNames
        .filter((_, dayIndex) => showWeekDay(dayIndex, disableWeekDays))
        .map((dayName, i) => (
          <DayName
            key={`${dayName.label}_${i}`}
            label={dayName.label}
            name={dayName.name}
          />
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  dayNames: {
    alignItems: 'center',
    flexDirection: 'row',
    height: dayNamesHeight,
  },
})

export default memo(DayNames)
