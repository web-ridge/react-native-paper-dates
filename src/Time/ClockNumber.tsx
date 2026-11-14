import { type StyleProp, StyleSheet, type TextStyle, View } from 'react-native'
import { Text } from 'react-native-paper'

export default function ClockNumber({
  left,
  textStyle,
  top,
  value,
}: {
  left: number
  textStyle?: StyleProp<TextStyle>
  top: number
  value: number | string
}) {
  return (
    <View pointerEvents="none" style={[styles.root, { left, top }]}>
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
    </View>
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
