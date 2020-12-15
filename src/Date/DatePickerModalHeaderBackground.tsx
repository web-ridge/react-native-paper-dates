import { overlay, useTheme } from 'react-native-paper'
import { Animated, SafeAreaView, StyleSheet } from 'react-native'
import * as React from 'react'

export default function DatePickerModalHeaderBackground({
  children,
}: {
  children: any
}) {
  const theme = useTheme()
  const backgroundColor =
    theme.dark && theme.mode === 'adaptive'
      ? overlay(4, theme.colors.surface)
      : theme.colors.primary

  return (
    <Animated.View
      style={[
        styles.animated,
        {
          backgroundColor,
        },
      ]}
    >
      <SafeAreaView style={styles.safeContent}>{children}</SafeAreaView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  animated: {
    paddingBottom: 0,
    elevation: 4,
  },
  safeContent: {
    paddingBottom: 0,
  },
})
