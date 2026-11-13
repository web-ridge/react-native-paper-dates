import { StyleSheet, View } from 'react-native'
import { Button, IconButton, useTheme } from 'react-native-paper'
import { useHeaderTextColor } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import { sharedStyles } from '../shared/styles'
import type { DisableWeekDaysType } from './dateUtils'
import {
  alignIconToFirstWeekday,
  alignTextToLastWeekday,
} from './weekdayColumns'

export interface DatePickerModalHeaderProps {
  closeIcon?: string
  disableWeekDays?: DisableWeekDaysType
  locale: string | undefined
  onDismiss: () => void
  onSave: () => void
  saveLabel?: string
  saveLabelDisabled?: boolean
  uppercase?: boolean
}

export default function DatePickerModalHeader(
  props: DatePickerModalHeaderProps
) {
  const { closeIcon = 'close', disableWeekDays, locale } = props
  const saveLabel = props.saveLabel || getTranslation(locale, 'save')
  const color = useHeaderTextColor()
  const theme = useTheme()

  return (
    <View style={styles.headerBar}>
      <IconButton
        accessibilityLabel={getTranslation(locale, 'close')}
        icon={closeIcon}
        iconColor={color}
        onPress={props.onDismiss}
        style={[styles.closeButton, alignIconToFirstWeekday(disableWeekDays)]}
        testID="react-native-paper-dates-close"
      />
      <View style={sharedStyles.root} />
      <View style={alignTextToLastWeekday(disableWeekDays)}>
        <Button
          disabled={props.saveLabelDisabled ?? false}
          mode="text"
          onPress={props.onSave}
          style={styles.saveButton}
          testID="react-native-paper-dates-save"
          textColor={theme.colors.primary}
        >
          {(props.uppercase ?? true) ? saveLabel.toUpperCase() : saveLabel}
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  closeButton: {
    marginBottom: 0,
    marginEnd: 0,
    marginTop: 0,
  },
  headerBar: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 12,
    width: '100%',
  },
  saveButton: {
    marginEnd: 0,
    marginVertical: 0,
  },
})
