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
  }: Omit<React.ComponentProps<typeof TextInput>, 'value' | 'onChange'> & {
    inputMode: 'start' | 'end'
    locale?: string
    onChange: (date: Date | undefined) => void
    value: Date | undefined
    validRange?: ValidRangeType | undefined
    withModal?: boolean
    withDateFormatInLabel?: boolean
  },
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
      if (date) {
        onChangeRef.current(date)
      }
    },
    [setVisible, onChangeRef]
  )

  return (
    <>
      <View style={styles.root}>
        <TextInputWithMask
          {...rest}
          ref={ref}
          label={
            withDateFormatInLabel ? `${label || ''} (${inputFormat})` : label
          }
          value={formattedValue}
          keyboardType={'number-pad'}
          placeholder={inputFormat}
          mask={inputFormat}
          onChangeText={onChangeText}
          keyboardAppearance={theme.dark ? 'dark' : 'default'}
          error={!!error}
          style={[styles.input, style]}
        />
        {withModal ? (
          <IconButton
            size={24}
            style={styles.calendarButton}
            icon="calendar"
            onPress={() => setVisible(true)}
          />
        ) : null}
      </View>
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
      {withModal ? (
        <DatePickerModal
          date={value}
          mode="single"
          visible={visible}
          onDismiss={onDismiss}
          onConfirm={onInnerConfirm}
          locale={locale}
          dateMode={inputMode}
        />
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    flex: 1,
  },
  input: { flex: 1 },
  calendarButton: { position: 'absolute', right: 0 },
})
export default React.forwardRef(DatePickerInput)
