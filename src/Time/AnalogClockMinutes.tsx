import { memo } from 'react'
import { useTextColorOnPrimary } from '../shared/utils'
import ClockNumber from './ClockNumber'
import { circleSize, clockNumbers } from './timeUtils'

const minuteNumbers = clockNumbers(12, 2.5, circleSize, -Math.PI / 2)

function AnalogClockMinutes({ minutes }: { minutes: number }) {
  const color = useTextColorOnPrimary()

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
            left={left}
            textStyle={selected ? { color } : undefined}
            top={top}
            value={isZero ? '00' : currentMinutes}
          />
        )
      })}
    </>
  )
}

export default memo(AnalogClockMinutes)
