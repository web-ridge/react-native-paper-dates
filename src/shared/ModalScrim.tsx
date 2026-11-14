import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { sharedStyles } from './styles'
import { scrimColor } from './utils'

export default function ModalScrim({ onDismiss }: { onDismiss: () => void }) {
  const theme = useTheme()

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <View
        style={[
          StyleSheet.absoluteFill,
          sharedStyles.root,
          { backgroundColor: scrimColor(theme.colors.scrim) },
        ]}
      />
    </TouchableWithoutFeedback>
  )
}
