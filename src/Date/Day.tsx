import { Text, TouchableRipple } from 'react-native-paper'
import { StyleSheet, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import DayRange from './DayRange'
import { daySize } from './dateUtils'

import type { PaperTheme } from '../shared/utils'
import type { DayContentPosition, DayContentRenderer } from './Calendar'
import { memo, useCallback } from 'react'

function EmptyDayPure() {
  return <View style={styles.empty} />
}

export const EmptyDay = memo(EmptyDayPure)

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
  dayContent?: DayContentRenderer
  dayContentPosition?: DayContentPosition
  dayContentStyle?: StyleProp<ViewStyle>
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
    theme,
    dayContent,
    dayContentPosition,
    dayContentStyle,
  } = props
  const borderColor = theme.colors.primary

  const onPress = useCallback(() => {
    onPressDate(new Date(year, month, day))
  }, [onPressDate, year, month, day])

  // Determine text colors for M3
  let baseTextColor
  let finalTextColor

  if (selected) {
    baseTextColor = theme.colors.onPrimary
  } else if (inRange && theme.dark) {
    baseTextColor = theme.colors.onPrimaryContainer
  } else {
    baseTextColor = theme.colors.onSurface
  }

  if (isToday) {
    finalTextColor = selected ? baseTextColor : theme.colors.primary
  } else {
    finalTextColor = baseTextColor
  }

  const textFont = theme.fonts.bodySmall

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
            maxFontSizeMultiplier={1.5}
            style={[
              baseTextColor
                ? {
                    color: finalTextColor,
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
      {dayContent ? (
        <View
          style={[
            styles.content,
            contentPositions[dayContentPosition || 'bottom'],
            dayContentStyle,
          ]}
          pointerEvents="none"
        >
          {dayContent({
            date: new Date(year, month, day),
            day,
            month,
            year,
            selected,
            isToday,
            disabled,
          })}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    width: daySize,
    height: daySize,
    overflow: 'hidden',
    borderRadius: daySize / 2,
  },
  content: {
    // Absolutely positioned without insets, so Yoga still honours the parent's
    // centering and this box lines up with the day circle instead of the
    // (wider) grid cell.
    position: 'absolute',
    width: daySize,
    height: daySize,
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
  disabled: {
    opacity: 0.3,
  },
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
})

// Anchors for `dayContent`, applied to a box the size of the day circle.
const contentPositions = StyleSheet.create({
  'bottom': {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 2,
  },
  'bottom-left': { justifyContent: 'flex-end', alignItems: 'flex-start' },
  'bottom-right': { justifyContent: 'flex-end', alignItems: 'flex-end' },
  'center': { justifyContent: 'center', alignItems: 'center' },
  'top': { justifyContent: 'flex-start', alignItems: 'center', paddingTop: 2 },
  'top-left': { justifyContent: 'flex-start', alignItems: 'flex-start' },
  'top-right': { justifyContent: 'flex-start', alignItems: 'flex-end' },
})

export default memo(Day)
