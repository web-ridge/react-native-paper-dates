import * as React from 'react'

import TextInputWithMask from '../TextInputMask'
import { HelperText, useTheme } from 'react-native-paper'
import { View, StyleSheet } from 'react-native'
import useDateInput from './inputUtils'
import type { DatePickerInputProps } from './DatePickerInput.shared'

function DatePickerInputWithoutModal(
  {
    label,
    value,
    onChange,
    style,
    locale,
    validRange,
    inputMode,
    withDateFormatInLabel = true,
    hasError,
    hideValidationErrors,
    onValidationError,
    modal,
    inputButtons,
    saveLabel,
    saveLabelDisabled,
    uppercase,
    startYear,
    endYear,
    onChangeText,
    inputEnabled,
    ...rest
  }: DatePickerInputProps & {
    modal?: (params: {
      value: DatePickerInputProps['value']
      locale: DatePickerInputProps['locale']
      inputMode: DatePickerInputProps['inputMode']
      validRange: DatePickerInputProps['validRange']
      saveLabel: DatePickerInputProps['saveLabel']
      saveLabelDisabled: DatePickerInputProps['saveLabelDisabled']
      uppercase: DatePickerInputProps['uppercase']
      startYear: DatePickerInputProps['startYear']
      endYear: DatePickerInputProps['endYear']
      inputEnabled: DatePickerInputProps['inputEnabled']
    }) => any
    inputButtons?: any
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
    locale,
    value,
    validRange,
    inputMode,
    onChange,
    onValidationError,
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
            ref={ref}
            label={getLabel({
              // TODO: support label components?
              label: label as any,
              inputFormat,
              withDateFormatInLabel,
            })}
            value={formattedValue}
            keyboardType={rest.keyboardType ?? 'number-pad'}
            mask={inputFormat}
            disabled={disabled}
            onChangeText={onDateInputChangeText}
            onChange={(e) => onChangeText && onChangeText(e.nativeEvent.text)}
            keyboardAppearance={theme.dark ? 'dark' : 'default'}
            error={(!!error && !hideValidationErrors) || !!hasError}
            style={[styles.input, style]}
          />
          {inputButtons}
        </View>
        {error && !hideValidationErrors ? (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        ) : null}
      </View>
      {modal?.({
        value,
        locale,
        inputMode,
        validRange,
        saveLabel,
        saveLabelDisabled,
        uppercase,
        startYear,
        endYear,
        inputEnabled,
      })}
    </>
  )
}

function getLabel({
  withDateFormatInLabel,
  inputFormat,
  label,
}: {
  withDateFormatInLabel: boolean
  inputFormat: string
  label: string | undefined
}) {
  if (withDateFormatInLabel) {
    return label ? `${label} (${inputFormat})` : inputFormat
  }
  return label || ''
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
  inputContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  input: {
    flexGrow: 1,
  },
})
export default React.forwardRef(DatePickerInputWithoutModal)
