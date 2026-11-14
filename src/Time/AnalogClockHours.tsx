import { memo } from 'react'
import { useTextColorOnPrimary } from '../shared/utils'
import ClockNumber from './ClockNumber'
import { circleSize, clockNumbers } from './timeUtils'

const hourStart = -Math.PI / 2 + Math.PI / 6

const innerHourNumbers = clockNumbers(12, 4, circleSize, hourStart)

const outerHourNumbers = clockNumbers(12, 2.5, circleSize, hourStart)

function AnalogClockHours({
  hours,
  is24Hour,
}: {
  hours: number
  is24Hour: boolean
}) {
  const color = useTextColorOnPrimary()

  return (
    <>
      {outerHourNumbers.map(([left, top], index) => {
        const label = index + 1
        const selected = isOuterHourSelected(hours, is24Hour, label)
        return (
          <ClockNumber
            key={index}
            left={left}
            textStyle={selected ? { color } : null}
            top={top}
            value={is24Hour && label === 12 ? '00' : label}
          />
        )
      })}
      {is24Hour
        ? innerHourNumbers.map(([left, top], index) => {
            const hour = index + 13
            const selected = hour === 24 ? hours === 12 : hour === hours
            return (
              <ClockNumber
                key={index}
                left={left}
                textStyle={selected ? { color } : null}
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
