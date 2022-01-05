import * as React from 'react'
import { View } from 'react-native'
import { Text, IconButton } from 'react-native-paper'

import DatePickerModal from './DatePickerModal'

// WORK IN PROGRESS
export default function DateRangeInput({ locale }: { locale: string }) {
  const [visible, setVisible] = React.useState<boolean>(false)
  const onDismiss = React.useCallback(() => {
    setVisible(false)
  }, [setVisible])
  const onConfirm = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ startDate, endDate }: { startDate: any; endDate: any }) => {
      setVisible(false)
      console.log({ startDate, endDate })
    },
    [setVisible]
  )

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        {/*<DatePickerInput*/}
        {/*  value={''}*/}
        {/*  keyboardType={'numeric'}*/}
        {/*  placeholder={'DD-MM-YYY'}*/}
        {/*  mask={'DD-MM-YYY'}*/}
        {/*  onChangeText={() => {}}*/}
        {/*/>*/}
        <Text>Van</Text>
      </View>
      <View>
        <Text style={{ fontSize: 16, marginLeft: 12, marginRight: 12 }}>
          to
        </Text>
        <Text style={{ opacity: 0 }} accessible={false}>
          tot
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        {/*<DatePickerInput*/}
        {/*  // value={''}*/}
        {/*  // keyboardType={'numeric'}*/}
        {/*  // placeholder={'DD-MM-YYY'}*/}
        {/*  // mask={'DD-MM-YYY'}*/}
        {/*  // onChangeText={() => {}}*/}
        {/*/>*/}
        <Text>Tot</Text>
      </View>
      <View>
        <IconButton icon="calendar" onPress={() => setVisible(true)} />
        <Text style={{ opacity: 0 }} accessible={false}>
          tot
        </Text>
      </View>
      <DatePickerModal
        locale={locale}
        mode="range"
        visible={visible}
        onDismiss={onDismiss}
        onConfirm={onConfirm}
        startDate={undefined}
        endDate={undefined}
      />
    </View>
  )
}
