import * as React from 'react'
import { MD2Theme, Text, TouchableRipple } from 'react-native-paper'
import { StyleSheet, View } from 'react-native'
import DayRange from './DayRange'
import { daySize } from './dateUtils'

import type { PaperTheme } from '../utils'

function EmptyDayPure() {
  return <View style={styles.empty} />
}
export const EmptyDay = React.memo(EmptyDayPure)

function Day(props: {
  theme: PaperTheme
  textColorOnPrimary: string
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
  disabled: boolean
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
    disabled,
    textColorOnPrimary,
    theme,
  } = props
  const onPress = React.useCallback(() => {
    onPressDate(new Date(year, month, day))
  }, [onPressDate, year, month, day])

  const borderColor = theme.isV3
    ? theme.colors.primary
    : selected || (inRange && theme.dark)
    ? textColorOnPrimary
    : theme.dark
    ? '#fff'
    : '#000'

  const textColor =
    theme.isV3 && selected
      ? theme.colors.onPrimary
      : theme.isV3 && inRange && theme.dark
      ? theme.colors.onPrimaryContainer
      : selected || (inRange && theme.dark)
      ? textColorOnPrimary
      : theme.isV3
      ? theme.colors.onSurface
      : undefined

  let textFont = theme?.isV3
    ? theme.fonts.bodySmall
    : (theme as any as MD2Theme).fonts.medium

  return (
    <View style={[styles.root, disabled && styles.disabled]}>
      <DayRange
        inRange={inRange}
        leftCrop={leftCrop}
        rightCrop={rightCrop}
        selectColor={selectColor}
      />
      <TouchableRipple
        testID={`react-native-paper-dates-day-${year}-${month}-${day}`}
        disabled={disabled}
        borderless={true}
        onPress={disabled ? undefined : onPress}
        style={[
          styles.button,
          { backgroundColor: inRange ? selectColor : undefined },
        ]}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.day,
            isToday ? { borderColor: borderColor } : null,
            selected ? { backgroundColor: primaryColor } : null,
          ]}
        >
          <Text
            style={[
              textColor
                ? {
                    color:
                      theme.isV3 && isToday && selected
                        ? textColor
                        : theme.isV3 && isToday
                        ? theme.colors.primary
                        : textColor,
                  }
                : undefined,
              { ...textFont },
            ]}
            selectable={false}
          >
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
  disabled: {
    opacity: 0.3,
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
