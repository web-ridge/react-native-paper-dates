import * as React from 'react'
import { Button } from 'react-native-paper'

import { DatePickerModal } from '../../src/index'

export default function ReadMeExampleMultiple() {
  const [dates, setDates] = React.useState<Date[] | undefined>()
  const [open, setOpen] = React.useState(false)

  const onDismiss = React.useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const onConfirm = React.useCallback((params: any) => {
    setOpen(false)
    setDates(params.dates)
    console.log('[on-change-multi]', params)
  }, [])

  return (
    <>
      <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
        Pick multiple dates
      </Button>

      <DatePickerModal
        locale="en"
        mode="multiple"
        visible={open}
        onDismiss={onDismiss}
        dates={dates}
        onConfirm={onConfirm}
        // validRange={{
        //   startDate: new Date(2021, 1, 2),  // optional
        //   endDate: new Date(), // optional
        //   disabledDates: [new Date()] // optional
        // }}
        // locale={'nl'} // optional
        // saveLabel="Save" // optional
        // saveLabelDisabled={true} // optional, default is false        // uppercase={false} // optional, default is true
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
