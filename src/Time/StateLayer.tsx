import { type ColorValue, StyleSheet, View } from 'react-native'
import { themeColor, withAlpha } from '../shared/utils'

const focusedStateLayerOpacity = 0.1

const hoveredStateLayerOpacity = 0.08

const pressedStateLayerOpacity = 0.1

export default function StateLayer({
  color,
  focused = false,
  hovered = false,
  pressed = false,
}: {
  color: ColorValue
  focused?: boolean
  hovered?: boolean
  pressed?: boolean
}) {
  const opacity =
    (focused ? focusedStateLayerOpacity : 0) +
    (hovered ? hoveredStateLayerOpacity : 0) +
    (pressed ? pressedStateLayerOpacity : 0)

  if (opacity === 0) {
    return null
  }

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: withAlpha(themeColor(color), opacity),
        },
      ]}
    />
  )
}
