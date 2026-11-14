import { type ReactElement } from 'react'
import { StyleSheet } from 'react-native'
import CrossFade from '../shared/CrossFade'
import AnalogClockHours from './AnalogClockHours'
import AnalogClockMinutes from './AnalogClockMinutes'
import { clockTypes, type PossibleClockTypes } from './timeUtils'

export default function AnimatedClockSwitcher({
  focused,
  hours,
  minutes,
}: {
  focused: PossibleClockTypes
  hours: ReactElement<typeof AnalogClockHours>
  minutes: ReactElement<typeof AnalogClockMinutes>
}) {
  return (
    <CrossFade
      collapsed={focused === clockTypes.hours}
      containerStyle={StyleSheet.absoluteFill}
      primary={{
        node: hours,
        scale: [0.95, 1],
        style: StyleSheet.absoluteFill,
      }}
      secondary={{
        node: minutes,
        scale: [1, 0.95],
        style: StyleSheet.absoluteFill,
      }}
    />
  )
}
