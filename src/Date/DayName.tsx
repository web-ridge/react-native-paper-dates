import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

function DayName({ label }: { label: string }) {
  const theme = useTheme()

  const textFont = theme.fonts.bodySmall

  return (
    <View style={styles.dayName}>
      <Text
        maxFontSizeMultiplier={1.5}
        selectable={false}
        style={[
          styles.dayNameLabel,
          { ...textFont, color: theme.colors.onSurfaceVariant },
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  dayName: {
    alignItems: 'center',
    flex: 1,
  },
  dayNameLabel: {
    fontSize: 14,
  },
})

export default memo(DayName)
