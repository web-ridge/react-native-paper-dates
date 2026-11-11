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
  saveLabel?: string
  saveLabelDisabled?: boolean
  uppercase?: boolean
  onDismiss: () => void
  onSave: () => void
  locale: string | undefined
  closeIcon?: string
  disableWeekDays?: DisableWeekDaysType
}

export default function DatePickerModalHeader(
  props: DatePickerModalHeaderProps
) {
  const { locale, closeIcon = 'close', disableWeekDays } = props
  const saveLabel = props.saveLabel || getTranslation(locale, 'save')
  const color = useHeaderTextColor()
  const theme = useTheme()

  return (
    <View style={styles.headerBar}>
      <IconButton
        icon={closeIcon}
        accessibilityLabel={getTranslation(locale, 'close')}
        onPress={props.onDismiss}
        iconColor={color}
        testID="react-native-paper-dates-close"
        style={[styles.closeButton, alignIconToFirstWeekday(disableWeekDays)]}
      />
      <View style={sharedStyles.root} />
      <View style={alignTextToLastWeekday(disableWeekDays)}>
        <Button
          textColor={theme.colors.primary}
          onPress={props.onSave}
          disabled={props.saveLabelDisabled ?? false}
          mode="text"
          testID="react-native-paper-dates-save"
          style={styles.saveButton}
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
