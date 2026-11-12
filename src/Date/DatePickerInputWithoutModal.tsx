import TextInputWithMask from '../TextInputMask'
import { useTheme } from 'react-native-paper'
import { StyleSheet, View } from 'react-native'
import useDateInput from './inputUtils'
import type { DatePickerInputProps } from './DatePickerInput.shared'
import { forwardRef, ReactNode } from 'react'

function DatePickerInputWithoutModal(
  {
    disableStatusBar,
    disableStatusBarPadding,
    endYear,
    hasError,
    hideValidationErrors,
    inputButton,
    inputEnabled,
    inputMode,
    label,
    locale,
    modal,
    onChange,
    onChangeText,
    onValidationError,
    saveLabel,
    saveLabelDisabled,
    startWeekOnMonday,
    startYear,
    style,
    uppercase,
    validRange,
    value,
    withDateFormatInLabel = true,
    ...rest
  }: DatePickerInputProps & {
    inputButton?: ReactNode
    modal?: (params: {
      disableStatusBar: DatePickerInputProps['disableStatusBar']
      disableStatusBarPadding: DatePickerInputProps['disableStatusBarPadding']
      endYear: DatePickerInputProps['endYear']
      inputEnabled: DatePickerInputProps['inputEnabled']
      inputMode: DatePickerInputProps['inputMode']
      locale: DatePickerInputProps['locale']
      saveLabel: DatePickerInputProps['saveLabel']
      saveLabelDisabled: DatePickerInputProps['saveLabelDisabled']
      startWeekOnMonday?: DatePickerInputProps['startWeekOnMonday']
      startYear: DatePickerInputProps['startYear']
      uppercase: DatePickerInputProps['uppercase']
      validRange: DatePickerInputProps['validRange']
      value: DatePickerInputProps['value']
    }) => any
  },
  ref: any
) {
  const theme = useTheme()
  const {
    formattedValue,
    inputFormat,
    onChangeText: onDateInputChangeText,
    error,
  } = useDateInput({
    inputMode,
    locale,
    onChange,
    onValidationError,
    validRange,
    value,
  })

  let disabled

  if (inputEnabled !== undefined) {
    disabled = !inputEnabled
  }

  if (rest.disabled) {
    disabled = rest.disabled
  }

  return (
    <>
      <View style={styles.root}>
        <View style={styles.inputContainer}>
          <TextInputWithMask
            {...rest}
            disabled={disabled}
            error={(!!error && !hideValidationErrors) || !!hasError}
            inputButton={inputButton}
            keyboardAppearance={
              rest.keyboardAppearance ?? (theme.dark ? 'dark' : 'default')
            }
            keyboardType={rest.keyboardType ?? 'number-pad'}
            label={getLabel({
              inputFormat,
              // TODO: support label components?
              label: label as any,
              withDateFormatInLabel,
            })}
            mask={inputFormat}
            onChange={(e) => onChangeText && onChangeText(e.nativeEvent.text)}
            onChangeText={onDateInputChangeText}
            ref={ref}
            style={style}
            supportingText={
              error && !hideValidationErrors ? error : rest.supportingText
            }
            value={formattedValue}
          />
        </View>
      </View>
      {modal?.({
        disableStatusBar,
        disableStatusBarPadding,
        endYear,
        inputEnabled,
        inputMode,
        locale,
        saveLabel,
        saveLabelDisabled,
        startWeekOnMonday,
        startYear,
        uppercase,
        validRange,
        value,
      })}
    </>
  )
}

function getLabel({
  inputFormat,
  label,
  withDateFormatInLabel,
}: {
  inputFormat: string
  label: string | undefined
  withDateFormatInLabel: boolean
}) {
  if (withDateFormatInLabel) {
    return label ? `${label} (${inputFormat})` : inputFormat
  }
  return label || ''
}

const styles = StyleSheet.create({
  inputContainer: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    flexGrow: 1,
    width: '100%',
  },
  root: {
    alignItems: 'flex-start',
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
})
export default forwardRef(DatePickerInputWithoutModal)
