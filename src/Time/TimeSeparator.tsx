import { type ColorValue, StyleSheet, View } from 'react-native'

import { timeSeparatorDotSize, timeSeparatorWidth } from './timeUtils'

export default function TimeSeparator({
  color,
  height,
}: {
  color: ColorValue
  height: number
}) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no"
      style={[styles.slot, { height }]}
      testID="time-separator"
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: timeSeparatorDotSize / 2,
    height: timeSeparatorDotSize,
    width: timeSeparatorDotSize,
  },
  slot: {
    alignItems: 'center',
    gap: timeSeparatorDotSize,
    justifyContent: 'center',
    width: timeSeparatorWidth,
  },
})
