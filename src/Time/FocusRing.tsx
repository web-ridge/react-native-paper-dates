import {
  type ColorValue,
  Platform,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native'
import { useTheme } from 'react-native-paper'

import { focusRingOffset, focusRingThickness } from './timeUtils'

function cssColor(color: ColorValue) {
  return typeof color === 'string' ? color : String(color)
}

export function focusRingLayout(radius: number, color: ColorValue): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      borderRadius: radius + focusRingOffset,
      borderWidth: 0,
      bottom: -focusRingOffset,
      boxShadow: `0 0 0 ${focusRingThickness}px ${cssColor(color)}`,
      left: -focusRingOffset,
      right: -focusRingOffset,
      top: -focusRingOffset,
    } as ViewStyle
  }
  return {
    borderColor: color,
    borderRadius: radius + focusRingOffset + focusRingThickness,
    borderWidth: focusRingThickness,
    bottom: -(focusRingThickness + focusRingOffset),
    left: -(focusRingThickness + focusRingOffset),
    right: -(focusRingThickness + focusRingOffset),
    top: -(focusRingThickness + focusRingOffset),
  }
}

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

function Ring({ color, radius }: { color?: ColorValue; radius: number }) {
  const theme = useTheme()
  const ringColor = color ?? theme.colors.secondary
  return (
    <View
      pointerEvents="none"
      style={[styles.ring, focusRingLayout(radius, ringColor)]}
    />
  )
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
  },
})
