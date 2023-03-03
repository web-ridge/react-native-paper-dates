import * as React from 'react'

import renderer from 'react-test-renderer'
import TimeInputs from '../../Time/TimeInputs'

it('renders TimeInputs', () => {
  const tree = renderer
    .create(
      <TimeInputs
        inputType="keyboard"
        hours={12}
        minutes={45}
        is24Hour
        onChange={() => null}
        onFocusInput={() => null}
        focused="hours"
      />
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
