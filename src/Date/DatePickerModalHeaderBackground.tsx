import { Animated } from 'react-native'
import { Divider } from 'react-native-paper'
import { useHeaderBackgroundColor } from '../shared/utils'
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
      style={{
        backgroundColor,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {children}
      <Divider />
    </Animated.View>
  )
}
