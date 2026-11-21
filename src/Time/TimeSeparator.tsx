import { type ColorValue, StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import { timeSeparatorWidth } from './timeUtils'

// Shared hour/minute separator used by the scroll wheels, keyboard fields,
// and dial fields. The slot is wider than the 16dp Expressive token so a
// 5dp focus ring on either field cannot reach the colon.
export default function TimeSeparator({
  color,
  height,
}: {
  color: ColorValue
  height: number
}) {
  const theme = useTheme()
  return (
    <View style={[styles.slot, { height }]}>
      <Text
        accessible={false}
        importantForAccessibility="no"
        maxFontSizeMultiplier={1.2}
        style={[theme.fonts.displayLargeEmphasized, styles.colon, { color }]}
      >
        :
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  colon: {
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: timeSeparatorWidth,
  },
})
