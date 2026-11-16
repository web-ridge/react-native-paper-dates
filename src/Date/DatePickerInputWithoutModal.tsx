import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactNode,
  type Ref,
} from 'react'
import { StyleSheet, View } from 'react-native'
import { TextInput, type TextInputHandles, useTheme } from 'react-native-paper'

import type { DateFieldProps } from './DatePickerInput.shared'
import useDateInput from './inputUtils'

function DatePickerInputWithoutModal(
  {
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
    style,
    validRange,
    value,
    withDateFormatInLabel = false,
    ...rest
  }: DateFieldProps & {
    inputButton?: ReactNode
    modal?: ReactNode
  },
  ref: Ref<TextInputHandles>
) {
  let disabled

  const {
    displayedValue,
    error,
    inputFormat,
    onBlur,
    onChangeText: onDateInputChangeText,
    onFocus,
    onSubmitEditing,
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

  const helperText =
    error && !hideValidationErrors ? error : rest.supportingText

  return (
    <>
      <View style={styles.root}>
        <View style={styles.inputContainer}>
          <TextInput
            {...rest}
            ref={ref}
            disabled={disabled}
            endAccessory={
              isValidElement(inputButton)
                ? (props) => cloneElement(inputButton, props)
                : undefined
            }
            error={(!!error && !hideValidationErrors) || !!hasError}
            keyboardAppearance={
              rest.keyboardAppearance ?? (theme.dark ? 'dark' : 'default')
            }
            keyboardType={rest.keyboardType ?? 'default'}
            label={getLabel({
              inputFormat,
              label,
              withDateFormatInLabel,
            })}
            onBlur={(event) => {
              onBlur()
              rest.onBlur?.(event)
            }}
            onChangeText={(text) => {
              onDateInputChangeText(text)
              onChangeText?.(text)
            }}
            onFocus={(event) => {
              onFocus()
              rest.onFocus?.(event)
            }}
            onSubmitEditing={(event) => {
              onSubmitEditing()
              rest.onSubmitEditing?.(event)
            }}
            placeholder={rest.placeholder ?? inputFormat}
            style={style}
            supportingText={helperText}
            value={displayedValue}
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
