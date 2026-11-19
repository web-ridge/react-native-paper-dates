import {
  Pressable,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  View,
} from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import { withAlpha } from '../shared/utils'
import FocusRing from './FocusRing'

export default function ClockNumber({
  accessibilityLabel,
  disabled = false,
  focused = false,
  hovered = false,
  left,
  onPress,
  selected = false,
  textStyle,
  top,
  value,
}: {
  accessibilityLabel?: string
  disabled?: boolean
  focused?: boolean
  hovered?: boolean
  left: number
  onPress?: () => void
  selected?: boolean
  textStyle?: StyleProp<TextStyle>
  top: number
  value: number | string
}) {
  const theme = useTheme()
  const hoverStyle = [
    styles.hover,
    { backgroundColor: withAlpha(theme.colors.onSurface, 0.08) },
  ]

  return (
    <Pressable
      accessibilityActions={onPress ? [{ name: 'activate' }] : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'button' : undefined}
      accessibilityState={
        accessibilityLabel
          ? { disabled: disabled || undefined, selected }
          : undefined
      }
      accessible={Boolean(accessibilityLabel)}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no'}
      onAccessibilityAction={(event) => {
        if (disabled) return
        if (event.nativeEvent.actionName === 'activate') {
          onPress?.()
        }
      }}
      onPress={disabled ? undefined : onPress}
      pointerEvents="none"
      style={[styles.root, { left, top }]}
    >
      <FocusRing focused={focused && !selected && !disabled} radius={24} />
      {hovered && !selected && !disabled ? (
        <View pointerEvents="none" style={hoverStyle} />
      ) : null}
      <View style={styles.inner}>
        <Text
          maxFontSizeMultiplier={1.5}
          selectable={false}
          style={textStyle}
          variant="bodyLarge"
        >
          {value}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  hover: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
  },
  inner: {
    borderRadius: 24,
  },
  root: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginLeft: -24,
    marginTop: -24,
    position: 'absolute',
    width: 48,
    zIndex: 20,
  },
})
