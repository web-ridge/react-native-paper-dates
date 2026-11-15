import { memo } from 'react'
import { useTheme } from 'react-native-paper'

import { getTranslation } from '../translations/utils'
import ClockNumber from './ClockNumber'
import { circleSize, clockNumbers } from './timeUtils'

const minuteNumbers = clockNumbers(12, 2.5, circleSize, -Math.PI / 2)

function AnalogClockMinutes({
  locale,
  minutes,
  onPress,
}: {
  locale?: string
  minutes: number
  onPress?: (minutes: number) => void
}) {
  const theme = useTheme()
  const selectedColor = theme.colors.onPrimary
  const unselectedColor = theme.colors.onSurface
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
        const selected = isZero
          ? minutes >= 59 || currentMinutes + 1 >= minutes
          : currentMinutes - 1 <= minutes && currentMinutes + 1 >= minutes
        return (
          <ClockNumber
            key={index}
            accessibilityLabel={minuteOf(currentMinutes, 60)}
            left={left}
            onPress={() => onPress?.(currentMinutes)}
            selected={selected}
            textStyle={{
              color: selected ? selectedColor : unselectedColor,
            }}
            top={top}
            value={isZero ? '00' : currentMinutes}
          />
        )
      })}
    </>
  )
}

export default memo(AnalogClockMinutes)
