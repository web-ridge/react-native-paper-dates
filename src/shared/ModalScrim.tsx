import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { sharedStyles } from './styles'
import { themeColor, withAlpha } from './utils'

export default function ModalScrim({ onDismiss }: { onDismiss: () => void }) {
  const theme = useTheme()

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <View
        style={[
          StyleSheet.absoluteFill,
          sharedStyles.root,
          {
            backgroundColor: withAlpha(themeColor(theme.colors.scrim), 0.32),
          },
        ]}
      />
    </TouchableWithoutFeedback>
  )
}
