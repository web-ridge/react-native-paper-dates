import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native'
import { Divider } from 'react-native-paper'
import { useHeaderBackgroundColor, useIsLargeScreen } from '../shared/utils'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { DisableWeekDaysType } from './dateUtils'
import { weekdaySpan, weekdaySpanOvershoot } from './weekdayColumns'

export default function DatePickerModalHeaderBackground({
  children,
  disableWeekDays,
}: {
  children: any
  disableWeekDays?: DisableWeekDaysType
}) {
  const backgroundColor = useHeaderBackgroundColor()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const isLargeScreen = useIsLargeScreen()
  const isPhoneLandscape = width > height && !isLargeScreen

  return (
    <Animated.View
      style={[
        styles.background,
        {
          backgroundColor,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {children}
      {isPhoneLandscape ? (
        <View style={weekdaySpan(disableWeekDays)}>
          <Divider style={weekdaySpanOvershoot} />
        </View>
      ) : (
        <Divider />
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
  },
})
