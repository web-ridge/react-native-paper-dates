import { type ColorValue, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { focusRingOffset, focusRingThickness } from './timeUtils'

export default function FocusRing({
  color,
  focused,
  radius,
}: {
  color?: ColorValue
  focused: boolean
  radius: number
}) {
  const theme = useTheme()
  if (!focused) return null

  const ringStyle = [
    styles.ring,
    {
      borderColor: color ?? theme.colors.secondary,
      borderRadius: radius + focusRingOffset + focusRingThickness,
    },
  ]

  return <View pointerEvents="none" style={ringStyle} />
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: focusRingThickness,
    bottom: -(focusRingThickness + focusRingOffset),
    left: -(focusRingThickness + focusRingOffset),
    position: 'absolute',
    right: -(focusRingThickness + focusRingOffset),
    top: -(focusRingThickness + focusRingOffset),
  },
})
