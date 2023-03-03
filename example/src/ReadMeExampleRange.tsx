import * as React from 'react'
import { Button } from 'react-native-paper'

import { DatePickerModal } from '../../src/index'

export default function ReadMeExampleRange() {
  const [range, setRange] = React.useState<{
    startDate: Date | undefined
    endDate: Date | undefined
  }>({ startDate: undefined, endDate: undefined })

  const [open, setOpen] = React.useState(false)

  const onDismiss = React.useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const onConfirm = React.useCallback(
    ({ startDate, endDate }: any) => {
      setOpen(false)
      setRange({ startDate, endDate })
    },
    [setOpen, setRange]
  )

  return (
    <>
      <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
        Pick range
      </Button>
      <DatePickerModal
        locale="en"
        mode="range"
        visible={open}
        onDismiss={onDismiss}
        startDate={range.startDate}
        endDate={range.endDate}
        onConfirm={onConfirm}
        // validRange={{
        //   startDate: new Date(2021, 1, 2),  // optional
        //   endDate: new Date(), // optional
        //   disabledDates: [new Date()] // optional
        // }}
        // onChange={} // same props as onConfirm but triggered without confirmed by user
        // locale={'nl'} // optional
        // saveLabel="Save" // optional
        // saveLabelDisabled={true} // optional, default is false
        // uppercase={false} // optional, default is true
        // label="Select period" // optional
        // startLabel="From" // optional
        // endLabel="To" // optional
        // animationType="slide" // optional, default is slide on ios/android and none on web
        // startYear={2000} // optional, default is 1800
        // endYear={2100} // optional, default is 2200
      />
    </>
  )
}
