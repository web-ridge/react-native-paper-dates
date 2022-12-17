import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { MD2Theme, Text, useTheme } from 'react-native-paper'

function DayName({ label }: { label: string }) {
  const theme = useTheme()

  let textFont = theme?.isV3
    ? theme.fonts.bodyMedium
    : (theme as any as MD2Theme).fonts.medium

  return (
    <View style={styles.dayName}>
      <Text style={[styles.dayNameLabel, { ...textFont }]} selectable={false}>
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
