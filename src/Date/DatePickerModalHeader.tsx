import { StyleSheet, View } from 'react-native'
import { Button, IconButton, useTheme } from 'react-native-paper'
import { useHeaderTextColor } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import { sharedStyles } from '../shared/styles'
import {
  countVisibleWeekDays,
  firstWeekdayColumnLeadingIconStyle,
  lastWeekdayColumnTrailingTextStyle,
  type DisableWeekDaysType,
} from './dateUtils'

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
  const visibleWeekDayCount = countVisibleWeekDays(disableWeekDays)

  return (
    <View style={styles.headerBar}>
      <IconButton
        icon={closeIcon}
        accessibilityLabel={getTranslation(locale, 'close')}
        onPress={props.onDismiss}
        iconColor={color}
        testID="react-native-paper-dates-close"
        style={[
          styles.closeButton,
          firstWeekdayColumnLeadingIconStyle(visibleWeekDayCount),
        ]}
      />
      <View style={sharedStyles.root} />
      <View style={lastWeekdayColumnTrailingTextStyle(visibleWeekDayCount)}>
        <Button
          textColor={theme.colors.primary}
          onPress={props.onSave}
          disabled={props.saveLabelDisabled ?? false}
          uppercase={props.uppercase ?? true}
          compact
          mode="text"
          testID="react-native-paper-dates-save"
          style={styles.saveButton}
        >
          {saveLabel}
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 12,
  },
  closeButton: {
    marginTop: 0,
    marginBottom: 0,
    marginEnd: 0,
  },
  saveButton: {
    marginVertical: 0,
    marginEnd: 0,
  },
})
