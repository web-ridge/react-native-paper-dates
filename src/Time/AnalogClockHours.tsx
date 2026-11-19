import { memo } from 'react'
import { useTheme } from 'react-native-paper'

import { withAlpha } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import ClockNumber from './ClockNumber'
import { circleSize, clockNumbers, disabledContentOpacity } from './timeUtils'

const hourStart = -Math.PI / 2 + Math.PI / 6
const innerHourNumbers = clockNumbers(12, 4, circleSize, hourStart)
const outerHourNumbers = clockNumbers(12, 2.5, circleSize, hourStart)

function AnalogClockHours({
  disabled,
  hours,
  hoveredHour = null,
  is24Hour,
  locale,
  onPress,
}: {
  disabled?: boolean
  hours: number
  hoveredHour?: number | null
  is24Hour: boolean
  locale?: string
  onPress?: (hours: number) => void
}) {
  const theme = useTheme()
  const selectedColor = disabled
    ? withAlpha(theme.colors.onPrimary, disabledContentOpacity)
    : theme.colors.onPrimary
  const unselectedColor = disabled
    ? withAlpha(theme.colors.onSurface, disabledContentOpacity)
    : theme.colors.onSurface
  const total = is24Hour ? 24 : 12
  const hourOf = getTranslation(
    locale,
    'hourOf',
    (hour, count) => `Hour ${hour} of ${count}`
  )

  return (
    <>
      {outerHourNumbers.map(([left, top], index) => {
        const label = index + 1
        const hourValue = is24Hour && label === 12 ? 0 : label
        const selected = isOuterHourSelected(hours, is24Hour, label)
        return (
          <ClockNumber
            key={index}
            accessibilityLabel={hourOf(hourValue, total)}
            disabled={disabled}
            hovered={hoveredHour === hourValue}
            left={left}
            onPress={disabled ? undefined : () => onPress?.(hourValue)}
            selected={selected}
            textStyle={{
              color: selected ? selectedColor : unselectedColor,
            }}
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
                accessibilityLabel={hourOf(hourValue, total)}
                disabled={disabled}
                hovered={hoveredHour === hourValue}
                left={left}
                onPress={disabled ? undefined : () => onPress?.(hourValue)}
                selected={selected}
                textStyle={{
                  color: selected ? selectedColor : unselectedColor,
                }}
                top={top}
                value={hour === 24 ? '12' : hour}
              />
            )
          })
        : null}
    </>
  )
}

function isOuterHourSelected(hours: number, is24Hour: boolean, label: number) {
  if (label === 12 && hours === 0) {
    return true
  }
  if (!is24Hour) {
    return label === hours
  }
  return label === hours && hours !== 12
}

export default memo(AnalogClockHours)
