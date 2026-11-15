import {
  Pressable,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  View,
} from 'react-native'
import { Text } from 'react-native-paper'

export default function ClockNumber({
  accessibilityLabel,
  left,
  onPress,
  selected = false,
  textStyle,
  top,
  value,
}: {
  accessibilityLabel?: string
  left: number
  onPress?: () => void
  selected?: boolean
  textStyle?: StyleProp<TextStyle>
  top: number
  value: number | string
}) {
  return (
    <Pressable
      accessibilityActions={onPress ? [{ name: 'activate' }] : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'button' : undefined}
      accessibilityState={accessibilityLabel ? { selected } : undefined}
      accessible={Boolean(accessibilityLabel)}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no'}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'activate') {
          onPress?.()
        }
      }}
      onPress={onPress}
      pointerEvents="none"
      style={[styles.root, { left, top }]}
    >
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
