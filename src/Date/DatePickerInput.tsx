import * as React from 'react'

import TextInputWithMask from '../TextInputMask'
import { HelperText, IconButton, TextInput, useTheme } from 'react-native-paper'
import { View, StyleSheet } from 'react-native'
import DatePickerModal from './DatePickerModal'
import useDateInput from './inputUtils'
import type { ValidRangeType } from './Calendar'
import { useLatest } from '../utils'

function DatePickerInput(
  {
    label,
    value,
    onChange,
    style,
    locale,
    validRange,
    inputMode,
    withModal = true,
    withDateFormatInLabel = true,
    ...rest
  }: {
    inputMode: 'start' | 'end'
    locale: string
    onChange: (date: Date | undefined) => void
    value: Date | undefined
    validRange?: ValidRangeType | undefined
    withModal?: boolean
    withDateFormatInLabel?: boolean
  } & Omit<
    React.ComponentProps<typeof TextInput>,
    'value' | 'onChange' | 'onChangeText'
  >,
  ref: any
) {
  const theme = useTheme()
  const { formattedValue, inputFormat, onChangeText, error } = useDateInput({
    locale,
    value,
    validRange,
    inputMode,
    onChange,
  })

  const [visible, setVisible] = React.useState<boolean>(false)
  const onDismiss = React.useCallback(() => {
    setVisible(false)
  }, [setVisible])
  const onChangeRef = useLatest(onChange)
  const onInnerConfirm = React.useCallback(
    ({ date }) => {
      setVisible(false)
      onChangeRef.current(date)
    },
    [setVisible, onChangeRef]
  )

  return (
    <>
      <View style={styles.root}>
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
          keyboardType={'number-pad'}
          placeholder={inputFormat}
          mask={inputFormat}
          onChangeText={onChangeText}
          keyboardAppearance={theme.dark ? 'dark' : 'default'}
          error={!!error}
          style={style}
        />
        {withModal ? (
          <IconButton
            size={24}
            style={styles.calendarButton}
            icon="calendar"
            onPress={() => setVisible(true)}
          />
        ) : null}
        <HelperText style={styles.helperText} type="error" visible={!!error}>
          {error}
        </HelperText>
      </View>
      {withModal ? (
        <DatePickerModal
          date={value}
          mode="single"
          visible={visible}
          onDismiss={onDismiss}
          onConfirm={onInnerConfirm}
          locale={locale}
          dateMode={inputMode}
          validRange={validRange}
        />
      ) : null}
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
    minWidth: 150,
    position: 'relative',
    flexGrow: 1,
  },
  helperText: {
    flexDirection: 'column',
  },
  calendarButton: { position: 'absolute', right: 0, zIndex: 10 },
})
export default React.forwardRef(DatePickerInput)
