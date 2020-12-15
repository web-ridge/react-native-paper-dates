import * as React from 'react'
import { Text, TouchableRipple, useTheme } from 'react-native-paper'
import { StyleSheet, View } from 'react-native'
import DayRange from './DayRange'
import { daySize } from './dateUtils'
import { useTextColorOnPrimary } from '../utils'

function EmptyDayPure() {
  return <View style={styles.empty} />
}
export const EmptyDay = React.memo(EmptyDayPure)

function Day(props: {
  day: number
  month: number
  year: number
  selected: boolean
  inRange: boolean
  leftCrop: boolean
  rightCrop: boolean
  primaryColor: string
  selectColor: string
  isToday: boolean
  onPressDate: (date: Date) => any
}) {
  const {
    day,
    month,
    year,
    selected,
    inRange,
    leftCrop,
    rightCrop,
    onPressDate,
    primaryColor,
    selectColor,
    isToday,
  } = props
  const theme = useTheme()
  const onPress = React.useCallback(() => {
    onPressDate(new Date(year, month, day))
  }, [onPressDate, year, month, day])
  const color = useTextColorOnPrimary()

  const borderColor =
    selected || (inRange && theme.dark) ? color : theme.dark ? '#fff' : '#000'
  const textColor = selected || (inRange && theme.dark) ? color : undefined

  return (
    <View style={[styles.root]}>
      <DayRange
        inRange={inRange}
        leftCrop={leftCrop}
        rightCrop={rightCrop}
        selectColor={selectColor}
      />

      <TouchableRipple
        borderless={true}
        onPress={onPress}
        style={[
          styles.button,
          { backgroundColor: inRange ? selectColor : undefined },
        ]}
      >
        <View
          style={[
            styles.day,
            isToday ? { borderColor: borderColor } : null,
            selected ? { backgroundColor: primaryColor } : null,
          ]}
        >
          <Text style={textColor && { color: textColor }} selectable={false}>
            {day}
          </Text>
        </View>
      </TouchableRipple>
    </View>
  )
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    flexBasis: 0,
  },
  root: {
    flexBasis: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  button: {
    width: daySize,
    height: daySize,
    overflow: 'hidden',
    borderRadius: daySize / 2,
  },
  day: {
    flexBasis: 0,
    flex: 1,
    borderRadius: daySize / 2,
    width: daySize,
    height: daySize,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  flex1: {
    flex: 1,
  },
})

export default React.memo(Day)
