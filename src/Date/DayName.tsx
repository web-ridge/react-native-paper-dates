import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'

function DayName({
  label,
  theme,
}: {
  label: string
  theme: ReactNativePaper.Theme
}) {
  return (
    <View style={styles.dayName}>
      <Text
        style={[styles.dayNameLabel, theme.fonts.medium]}
        selectable={false}
        theme={theme}
      >
        {label}
      </Text>
    </View>
  )
}
const styles = StyleSheet.create({
  dayName: { flex: 1, alignItems: 'center' },
  dayNameLabel: { fontSize: 14, opacity: 0.7 },
})
export default React.memo(DayName)
