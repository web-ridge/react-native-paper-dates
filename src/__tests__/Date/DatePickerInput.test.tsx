import * as React from 'react'

import renderer from 'react-test-renderer'
import DatePickerInput from '../../Date/DatePickerInput'

it('renders DatePickerInput', () => {
  const tree = renderer
    .create(
      <DatePickerInput
        locale={'en'}
        value={undefined}
        onChange={() => null}
        inputMode="start"
        autoComplete={'birthdate-full'}
      />
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
