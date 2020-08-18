import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import fonts from '../fonts'

function DayName({ label }: { label: string }) {
  return (
    <View style={styles.dayName}>
      <Text style={styles.dayNameLabel}>{label}</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  dayName: { flex: 1, alignItems: 'center' },
  dayNameLabel: { fontSize: 14, ...fonts.medium, opacity: 0.7 },
})
export default React.memo(DayName)
