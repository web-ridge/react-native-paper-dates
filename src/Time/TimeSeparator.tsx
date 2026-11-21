import { type ColorValue, StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import { timeSeparatorWidth } from './timeUtils'

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
