import * as React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHeaderBackgroundColor } from '../utils'
import Color from 'color'
import { Animated, StatusBar, StatusBarStyle } from 'react-native'

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
    : headerBackgroundColor

  return (
    <>
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
      {!disableStatusBar && (
        <StatusBar
          barStyle={statusBarTheme}
          translucent={true}
          backgroundColor="transparent"
        />
      )}
    </>
  )
}

export default React.memo(DatePickerModalStatusBar)
