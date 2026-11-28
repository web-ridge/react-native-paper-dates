import { StyleSheet } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import { getTranslation } from '../translations/utils'

export function timePickerErrorMessage(
  error: boolean | undefined,
  errorText: string | undefined,
  inputInvalid: boolean,
  locale?: string
) {
  if (!error && !inputInvalid) {
    return undefined
  }
  if (errorText !== undefined) {
    return errorText === '' ? undefined : errorText
  }
  return getTranslation(locale, 'invalidTime', 'Invalid time')
}

export default function TimePickerSupportingText({
  message,
}: {
  message?: string
}) {
  const theme = useTheme()
  if (!message) {
    return null
  }
  return (
    <Text
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      maxFontSizeMultiplier={1.5}
      style={[styles.supportingText, { color: theme.colors.error }]}
      variant="bodySmall"
    >
      {message}
    </Text>
  )
}

const styles = StyleSheet.create({
  supportingText: {
    alignSelf: 'stretch',
    marginTop: 7,
  },
})
