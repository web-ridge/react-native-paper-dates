import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { DatePickerModal } from 'react-native-paper-dates'

export default function App() {
  const [open, setOpen] = React.useState<boolean>(false)

  return (
    <View style={styles.container}>
      <DatePickerModal
        mode="range"
        startDate={undefined}
        endDate={undefined}
        visible={open}
        onConfirm={() => {}}
        onDismiss={() => setOpen(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
