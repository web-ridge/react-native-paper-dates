import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

function DayName({ label }: { label: string }) {
  const theme = useTheme()

  const textFont = theme.fonts.bodyLarge

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.dayName}
    >
      <Text
        maxFontSizeMultiplier={1.5}
        selectable={false}
        style={[textFont, { color: theme.colors.onSurface }]}
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
})

export default memo(DayName)
