import * as React from 'react'

import TextInputWithMask from '../TextInputMask'
import { IconButton, TextInput } from 'react-native-paper'
import { View, StyleSheet } from 'react-native'
import DatePickerModal from './DatePickerModal'
import { useInputFormat, useInputFormatter } from './dateUtils'
import type { SingleChange } from './Calendar'

export default function DatePickerInput({
  // value,
  // onConfirm,
  style,
  locale,
  ...rest
}: React.ComponentProps<typeof TextInput> & {
  locale?: undefined | string
  onChange?: SingleChange
  // onConfirm: any // TODO: fix
}) {
  const formatter = useInputFormatter({ locale })
  const inputFormat = useInputFormat({ formatter })
  const [visible, setVisible] = React.useState<boolean>(false)
  const onDismiss = React.useCallback(() => {
    setVisible(false)
  }, [setVisible])
  const onInnerConfirm = React.useCallback(() => {
    setVisible(false)
  }, [setVisible])

  return (
    <>
      <View style={styles.root}>
        <TextInputWithMask
          keyboardType={'numeric'}
          placeholder={inputFormat}
          mask={inputFormat}
          onChangeText={() => {}}
          style={[styles.input, style]}
          {...rest}
        />
        <IconButton
          size={24}
          style={styles.calendarButton}
          icon="calendar"
          onPress={() => setVisible(true)}
        />
      </View>
      <DatePickerModal
        mode="single"
        visible={visible}
        onDismiss={onDismiss}
        onConfirm={onInnerConfirm}
        locale={locale}
      />
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
