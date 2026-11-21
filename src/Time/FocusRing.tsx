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
  if (!focused) return null
  return <Ring color={color} radius={radius} />
}

// Split out so an unfocused ring reads no theme context and costs nothing in
// lists like the calendar days.
function Ring({ color, radius }: { color?: ColorValue; radius: number }) {
  const theme = useTheme()
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
