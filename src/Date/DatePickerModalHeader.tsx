import { Animated, StyleSheet } from 'react-native'
import { Appbar, Button, useTheme } from 'react-native-paper'
import { useHeaderTextColor } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface DatePickerModalHeaderProps {
  saveLabel?: string
  saveLabelDisabled?: boolean
  uppercase?: boolean
  onDismiss: () => void
  onSave: () => void
  locale: string | undefined
  closeIcon?: string
}

export default function DatePickerModalHeader(
  props: DatePickerModalHeaderProps
) {
  const { locale, closeIcon = 'close' } = props
  const saveLabel = props.saveLabel || getTranslation(locale, 'save')
  const color = useHeaderTextColor()
  const insets = useSafeAreaInsets()

  const theme = useTheme()

  return (
    <>
      <Animated.View
        style={[
          styles.animated,
          {
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <Appbar style={styles.appbarHeader}>
          <Appbar.Action
            icon={closeIcon}
            accessibilityLabel={getTranslation(locale, 'close')}
            onPress={props.onDismiss}
            color={color}
            testID="react-native-paper-dates-close"
          />
          <Button
            textColor={theme.isV3 ? theme.colors.primary : color}
            onPress={props.onSave}
            disabled={props.saveLabelDisabled ?? false}
            uppercase={props.uppercase ?? true}
            contentStyle={styles.buttonStyle}
            mode="text"
            labelStyle={styles.buttonLabel}
            testID="react-native-paper-dates-save"
          >
            {saveLabel}
          </Button>
        </Appbar>
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  animated: {
    elevation: 4,
  },
  appbarHeader: {
    elevation: 0,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  buttonStyle: {
    paddingHorizontal: 8,
  },
  buttonLabel: {
    flexGrow: 1,
  },
})
