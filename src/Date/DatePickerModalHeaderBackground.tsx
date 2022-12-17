import { Animated, StyleSheet } from 'react-native'
import * as React from 'react'
import { useHeaderBackgroundColor } from '../utils'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function DatePickerModalHeaderBackground({
  children,
}: {
  children: any
}) {
  const backgroundColor = useHeaderBackgroundColor()
  const insets = useSafeAreaInsets()
  return (
    <Animated.View
      style={[
        styles.animated,
        {
          backgroundColor,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  animated: {
    elevation: 4,
  },
})
