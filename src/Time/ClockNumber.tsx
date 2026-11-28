import { memo, useState } from 'react'
import { type ColorValue, Pressable, StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import { withAlpha } from '../shared/utils'
import FocusRing from './FocusRing'

function ClockNumber({
  accessibilityLabel,
  color,
  disabled = false,
  hovered = false,
  left,
  onFocusChange,
  onPress,
  pressValue,
  selected = false,
  top,
  value,
}: {
  accessibilityLabel?: string
  color?: ColorValue
  disabled?: boolean
  hovered?: boolean
  left: number
  onFocusChange?: (focused: boolean, selected: boolean) => void
  onPress?: (value: number) => void
  pressValue?: number
  selected?: boolean
  top: number
  value: number | string
}) {
  const theme = useTheme()
  const [focused, setFocused] = useState(false)
  const press =
    pressValue === undefined ? undefined : () => onPress?.(pressValue)
  const showFocusRing = focused && !selected && !disabled

  return (
    <Pressable
      accessibilityActions={press ? [{ name: 'activate' }] : undefined}
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
          press?.()
        }
      }}
      onBlur={() => {
        setFocused(false)
        onFocusChange?.(false, selected)
      }}
      onFocus={() => {
        if (disabled) return
        setFocused(true)
        onFocusChange?.(true, selected)
      }}
      onPress={disabled ? undefined : press}
      pointerEvents="none"
      style={[
        styles.root,
        showFocusRing ? styles.focused : null,
        { left, top },
      ]}
    >
      {showFocusRing ? <FocusRing focused radius={24} /> : null}
      {hovered && !selected && !disabled ? (
        <View
          pointerEvents="none"
          style={[
            styles.hover,
            { backgroundColor: withAlpha(theme.colors.onSurface, 0.08) },
          ]}
        />
      ) : null}
      <View style={styles.inner}>
        <Text
          maxFontSizeMultiplier={1.5}
          selectable={false}
          style={color === undefined ? undefined : { color }}
          variant="bodyLarge"
        >
          {value}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  focused: {
    zIndex: 30,
  },
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
    overflow: 'visible',
    position: 'absolute',
    width: 48,
    zIndex: 20,
  },
})

export default memo(ClockNumber)
