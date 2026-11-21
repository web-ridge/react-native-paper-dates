import { memo } from 'react'
import { useTheme } from 'react-native-paper'

import { withAlpha } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import ClockNumber from './ClockNumber'
import { circleSize, clockNumbers, disabledContentOpacity } from './timeUtils'

const minuteNumbers = clockNumbers(12, 2.5, circleSize, -Math.PI / 2)

function minuteMatches(label: number, value: number) {
  if (label === 0) return value >= 59 || value <= 1
  return label - 1 <= value && value <= label + 1
}

function AnalogClockMinutes({
  disabled,
  hoveredMinute = null,
  locale,
  minutes,
  onNumberFocus,
  onPress,
}: {
  disabled?: boolean
  hoveredMinute?: number | null
  locale?: string
  minutes: number
  onNumberFocus?: (focused: boolean, selected: boolean) => void
  onPress?: (minutes: number) => void
}) {
  const theme = useTheme()
  const selectedColor = disabled
    ? withAlpha(theme.colors.onPrimary, disabledContentOpacity)
    : theme.colors.onPrimary
  const unselectedColor = disabled
    ? withAlpha(theme.colors.onSurface, disabledContentOpacity)
    : theme.colors.onSurface
  const minuteOf = getTranslation(
    locale,
    'minuteOf',
    (minute, count) => `Minute ${minute} of ${count}`
  )

  return (
    <>
      {minuteNumbers.map(([left, top], index) => {
        const currentMinutes = index * 5
        const isZero = currentMinutes === 0
        const selected = minuteMatches(currentMinutes, minutes)
        const hovered =
          hoveredMinute !== null && minuteMatches(currentMinutes, hoveredMinute)
        return (
          <ClockNumber
            key={index}
            accessibilityLabel={minuteOf(currentMinutes, 60)}
            disabled={disabled}
            hovered={hovered}
            left={left}
            onFocusChange={onNumberFocus}
            onPress={onPress}
            pressValue={disabled ? undefined : currentMinutes}
            selected={selected}
            color={selected ? selectedColor : unselectedColor}
            top={top}
            value={isZero ? '00' : currentMinutes}
          />
        )
      })}
    </>
  )
}

export default memo(AnalogClockMinutes)
