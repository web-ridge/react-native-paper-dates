import * as React from 'react'

import TextInputWithMask from '../TextInputMask'
import { IconButton } from 'react-native-paper'
import { View, StyleSheet } from 'react-native'
import DatePickerModal from './DatePickerModal'

export default function DatePickerInput() {
  const [visible, setVisible] = React.useState<boolean>(false)
  const onDismiss = React.useCallback(() => {
    setVisible(false)
  }, [setVisible])
  const onConfirm = React.useCallback(() => {
    setVisible(false)
  }, [setVisible])

  return (
    <>
      <View style={styles.root}>
        <TextInputWithMask
          value={''}
          keyboardType={'numeric'}
          placeholder={'DD-MM-YYY'}
          mask={'DD-MM-YYY'}
          onChangeText={() => {}}
          style={styles.input}
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
        onConfirm={onConfirm}
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
