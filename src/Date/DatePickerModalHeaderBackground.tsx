import { Animated, SafeAreaView, StyleSheet } from 'react-native'
import * as React from 'react'
import { useHeaderBackgroundColor } from '../utils'

export default function DatePickerModalHeaderBackground({
  children,
  theme,
}: {
  children: any
  theme: ReactNativePaper.Theme
}) {
  const backgroundColor = useHeaderBackgroundColor(theme)

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
