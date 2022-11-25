import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, Theme, useTheme } from 'react-native-paper'
import type {
  Fonts,
  MD3Typescale,
} from 'react-native-paper/lib/typescript/types'

function DayName({ label }: { label: string }) {
  const theme: Theme = useTheme()

  let textFont = (theme.fonts as Fonts)?.medium

  if (theme.isV3) {
    textFont = (theme.fonts as MD3Typescale)?.bodyMedium
  }

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
