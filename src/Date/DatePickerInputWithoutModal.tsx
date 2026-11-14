import TextInputWithMask from '../TextInputMask'
import { useTheme } from 'react-native-paper'
import { StyleSheet, View } from 'react-native'
import useDateInput from './inputUtils'
import type { DatePickerInputProps } from './DatePickerInput.shared'
import { forwardRef, type ReactNode, type Ref } from 'react'
import type { TextInputHandles } from 'react-native-paper'

function DatePickerInputWithoutModal(
  {
    disableStatusBar: _disableStatusBar,
    disableStatusBarPadding: _disableStatusBarPadding,
    endYear: _endYear,
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
    saveLabel: _saveLabel,
    saveLabelDisabled: _saveLabelDisabled,
    startWeekOnMonday: _startWeekOnMonday,
    startYear: _startYear,
    style,
    uppercase: _uppercase,
    validRange,
    value,
    withDateFormatInLabel = true,
    ...rest
  }: DatePickerInputProps & {
    inputButton?: ReactNode
    modal?: ReactNode
  },
  ref: Ref<TextInputHandles>
) {
  let disabled

  const {
    error,
    formattedValue,
    inputFormat,
    onChangeText: onDateInputChangeText,
  } = useDateInput({
    inputMode,
    locale,
    onChange,
    onValidationError,
    validRange,
    value,
  })

  const theme = useTheme()

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
              label,
              withDateFormatInLabel,
            })}
            mask={inputFormat}
            onChange={(e) => onChangeText?.(e.nativeEvent.text)}
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
      {modal}
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
