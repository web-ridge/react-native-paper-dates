import * as React from 'react'

import { DatePickerInput } from 'react-native-paper-dates'

export default function ReadMeExampleDatePickerInput() {
  const [inputDate, setInputDate] = React.useState<Date | undefined>(undefined)

  return (
    <>
      <DatePickerInput
        locale="en"
        label="Birthdate"
        value={inputDate}
        onChange={(d) => setInputDate(d)}
        inputMode="start"
        autoComplete="birthdate-full"
        // mode="outlined" (see react-native-paper docs)
        // other react native TextInput props
      />
    </>
  )
}
