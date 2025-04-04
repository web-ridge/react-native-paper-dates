import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { MD2Theme, Text, useTheme } from 'react-native-paper'

function DayName({ label }: { label: string }) {
  const theme = useTheme()

  let textFont = theme?.isV3
    ? theme.fonts.bodySmall
    : (theme as any as MD2Theme).fonts.medium

  return (
    <View style={styles.dayName}>
      <Text
        maxFontSizeMultiplier={1.5}
        style={[
          styles.dayNameLabel,
          { ...textFont, color: theme.colors.onSurface },
        ]}
        selectable={false}
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
    opacity: 0.7,
  },
})

export default memo(DayName)
