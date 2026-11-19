import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

const focusRingOffset = 2
const focusRingThickness = 3

export default function FocusRing({
  focused,
  radius,
}: {
  focused: boolean
  radius: number
}) {
  const theme = useTheme()
  if (!focused) return null

  const ringStyle = [
    styles.ring,
    {
      borderColor: theme.colors.secondary,
      borderRadius: radius > 100 ? radius : radius + focusRingOffset,
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
