import { memo } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

function DayName({ label, name }: { label: string; name?: string }) {
  const theme = useTheme()

  const accessibleName = name ?? label
  const textFont = theme.fonts.bodyLarge

  return (
    <View
      accessibilityLabel={accessibleName}
      focusable={false}
      role="columnheader"
      style={styles.dayName}
      {...(Platform.OS === 'web' ? { title: accessibleName } : null)}
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
