import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

function DayName({ label }: { label: string }) {
  const theme = useTheme()
  return (
    <View style={styles.dayName}>
      <Text
        style={[styles.dayNameLabel, theme.fonts.medium]}
        selectable={false}
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
