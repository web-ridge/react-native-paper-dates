import type { ReactNode } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { Divider } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useHeaderBackgroundColor, useIsLargeScreen } from '../shared/utils'
import type { DisableWeekDaysType } from './types'
import { weekdaySpan, weekdaySpanOvershoot } from './weekdayColumns'

export default function DatePickerModalHeaderBackground({
  children,
  disableWeekDays,
  divider = true,
  insetHorizontal = false,
}: {
  children: ReactNode
  disableWeekDays?: DisableWeekDaysType
  divider?: boolean
  insetHorizontal?: boolean
}) {
  const backgroundColor = useHeaderBackgroundColor()
  const { height, width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const isLargeScreen = useIsLargeScreen()
  const isPhoneLandscape = width > height && !isLargeScreen

  return (
    <View
      style={[
        styles.background,
        { backgroundColor },
        insetHorizontal
          ? { paddingLeft: insets.left, paddingRight: insets.right }
          : null,
      ]}
    >
      {children}
      {divider ? (
        isPhoneLandscape ? (
          <View style={weekdaySpan(disableWeekDays)}>
            <Divider style={weekdaySpanOvershoot} />
          </View>
        ) : (
          <Divider />
        )
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
  },
})
