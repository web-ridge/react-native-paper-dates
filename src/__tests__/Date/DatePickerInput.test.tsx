import * as React from 'react'

import renderer from 'react-test-renderer'
import DatePickerInput from '../../Date/DatePickerInput'
import { SafeAreaProvider } from 'react-native-safe-area-context'

it('renders DatePickerInput', () => {
  const tree = renderer
    .create(
      <SafeAreaProvider>
        <DatePickerInput
          locale={'en'}
          value={new Date('12/26/2022')}
          onChange={() => null}
          inputMode="start"
          autoComplete={'birthdate-full'}
        />
      </SafeAreaProvider>
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
