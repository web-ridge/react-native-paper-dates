import { memo } from 'react'
import { useTheme } from 'react-native-paper'

import { withAlpha } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import ClockNumber from './ClockNumber'
import { circleSize, clockNumbers, disabledContentOpacity } from './timeUtils'

const hourStart = -Math.PI / 2 + Math.PI / 6
const innerHourNumbers = clockNumbers(12, 4, circleSize, hourStart)
const outerHourNumbers = clockNumbers(12, 2.5, circleSize, hourStart)

function isOuterHourSelected(hours: number, is24Hour: boolean, label: number) {
  if (label === 12 && hours === 0) {
    return true
  }
  if (!is24Hour) {
    return label === hours
  }
  return label === hours && hours !== 12
}

function AnalogClockHours({
  disabled,
  hours,
  hoveredHour = null,
  is24Hour,
  locale,
  onNumberFocus,
  onPress,
}: {
  disabled?: boolean
  hours: number
  hoveredHour?: number | null
  is24Hour: boolean
  locale?: string
  onNumberFocus?: (focused: boolean, selected: boolean) => void
  onPress?: (hours: number) => void
}) {
  const theme = useTheme()

  const hourAt = getTranslation(locale, 'hourAt', (hour) => `Hour ${hour}`)
  const hourOf = getTranslation(
    locale,
    'hourOf',
    (hour, count) => `Hour ${hour} of ${count}`
  )
  const hourLabel = (hourValue: number) =>
    is24Hour ? hourAt(hourValue) : hourOf(hourValue, 12)

  const selectedColor = disabled
    ? withAlpha(theme.colors.onPrimary, disabledContentOpacity)
    : theme.colors.onPrimary

  const unselectedColor = disabled
    ? withAlpha(theme.colors.onSurface, disabledContentOpacity)
    : theme.colors.onSurface

  return (
    <>
      {outerHourNumbers.map(([left, top], index) => {
        const label = index + 1
        const hourValue = is24Hour && label === 12 ? 0 : label
        const selected = isOuterHourSelected(hours, is24Hour, label)
        return (
          <ClockNumber
            key={index}
            accessibilityLabel={hourLabel(hourValue)}
            color={selected ? selectedColor : unselectedColor}
            disabled={disabled}
            hovered={hoveredHour === hourValue}
            left={left}
            onFocusChange={onNumberFocus}
            onPress={onPress}
            pressValue={disabled ? undefined : hourValue}
            selected={selected}
            top={top}
            value={is24Hour && label === 12 ? '00' : label}
          />
        )
      })}
      {is24Hour
        ? innerHourNumbers.map(([left, top], index) => {
            const hour = index + 13
            const hourValue = hour === 24 ? 12 : hour
            const selected = hour === 24 ? hours === 12 : hour === hours
            return (
              <ClockNumber
                key={index}
                accessibilityLabel={hourLabel(hourValue)}
                color={selected ? selectedColor : unselectedColor}
                disabled={disabled}
                hovered={hoveredHour === hourValue}
                left={left}
                onFocusChange={onNumberFocus}
                onPress={onPress}
                pressValue={disabled ? undefined : hourValue}
                selected={selected}
                top={top}
                value={hour === 24 ? '12' : hour}
              />
            )
          })
        : null}
    </>
  )
}

export default memo(AnalogClockHours)
