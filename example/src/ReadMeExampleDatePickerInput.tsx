import * as React from 'react'

import { DatePickerInput } from '../../src/index'

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
        // FIXME : remove the ts error
        // @ts-ignore
        autoCompleteType="birthdate-full"
        // mode="outlined" (see react-native-paper docs)
        // other react native TextInput props
      />
    </>
  )
}
