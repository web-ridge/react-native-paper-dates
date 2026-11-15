import { memo } from 'react'
import {
  StatusBar,
  type StatusBarProps,
  type StatusBarStyle,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  isDarkColor,
  themeColor,
  useHeaderBackgroundColor,
} from '../shared/utils'

function DatePickerModalStatusBar({
  disableSafeTop,
  disableStatusBar,
  statusBarOnTopOfBackdrop,
}: {
  disableSafeTop: boolean
  disableStatusBar: boolean
  statusBarOnTopOfBackdrop: boolean
}) {
  const headerBackgroundColor = useHeaderBackgroundColor()
  const insets = useSafeAreaInsets()
  const onDarkBackground =
    isDarkColor(themeColor(headerBackgroundColor)) || statusBarOnTopOfBackdrop
  const statusBarBackground = statusBarOnTopOfBackdrop
    ? 'transparent'
    : headerBackgroundColor
  const statusBarTheme: StatusBarStyle = onDarkBackground
    ? 'light-content'
    : 'dark-content'

  return (
    <>
      {!disableSafeTop && !statusBarOnTopOfBackdrop && (
        <View
          style={{
            backgroundColor: statusBarBackground,
            height: insets.top || StatusBar.currentHeight,
          }}
        />
      )}
      {!disableStatusBar && (
        <StatusBar
          {...({
            backgroundColor: 'transparent',
            barStyle: statusBarTheme,
            translucent: true,
          } as StatusBarProps)}
        />
      )}
    </>
  )
}

export default memo(DatePickerModalStatusBar)
