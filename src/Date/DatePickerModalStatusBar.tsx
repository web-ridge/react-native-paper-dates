import * as React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHeaderBackgroundColor } from '../utils'
import Color from 'color'
import { Platform, Animated, StatusBar, StatusBarStyle } from 'react-native'

function DatePickerModalStatusBar({
  disableSafeTop,
  disableStatusBar,
  statusBarOnTopOfBackdrop,
}: {
  disableSafeTop: boolean
  disableStatusBar: boolean
  statusBarOnTopOfBackdrop: boolean
}) {
  const insets = useSafeAreaInsets()
  const headerBackgroundColor = useHeaderBackgroundColor()
  const onDarkBackground =
    Color(headerBackgroundColor).isDark() || statusBarOnTopOfBackdrop
  const statusBarTheme: StatusBarStyle = onDarkBackground
    ? 'light-content'
    : 'dark-content'
  const statusBarBackground = statusBarOnTopOfBackdrop
    ? 'transparent'
    : Platform.select({
        android: headerBackgroundColor,
        ios: headerBackgroundColor,
        web: headerBackgroundColor,
      })

  return (
    <>
      {!disableStatusBar && (
        <StatusBar
          barStyle={statusBarTheme}
          backgroundColor={statusBarBackground}
          translucent={true}
        />
      )}
      {!disableSafeTop && !statusBarOnTopOfBackdrop && (
        <Animated.View
          style={[
            {
              backgroundColor: statusBarBackground,
              height: insets.top || StatusBar.currentHeight,
            },
          ]}
        />
      )}
    </>
  )
}

export default React.memo(DatePickerModalStatusBar)
