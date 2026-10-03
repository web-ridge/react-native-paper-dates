import {
  Animated,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { Divider } from 'react-native-paper'
import { useHeaderBackgroundColor } from '../shared/utils'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  countVisibleWeekDays,
  weekdayLetterSpanExpandStyle,
  weekdayLetterSpanStyle,
  type DisableWeekDaysType,
} from './dateUtils'

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
  const visibleWeekDayCount = countVisibleWeekDays(disableWeekDays)
  // Phone landscape only (e.g. 932x430). Tablets are >650 in both axes
  // even when rotated, and the divider should stay edge-to-edge there.
  const isPhoneLandscape =
    width > height && !(width > 650 && height > 650)

  return (
    <Animated.View
      style={{
        backgroundColor,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        width: '100%',
      }}
    >
      {children}
      {isPhoneLandscape ? (
        <View style={styles.dividerTrack}>
          <View style={weekdayLetterSpanStyle(visibleWeekDayCount)}>
            <Divider style={weekdayLetterSpanExpandStyle} />
          </View>
        </View>
      ) : (
        <Divider />
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  dividerTrack: {
    width: '100%',
  },
})
