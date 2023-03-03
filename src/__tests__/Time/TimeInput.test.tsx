import * as React from 'react'

import renderer from 'react-test-renderer'
import TimeInput from '../../Time/TimeInput'
import { clockTypes } from '../../Time/timeUtils'

it('renders TimeInput', () => {
  const tree = renderer
    .create(
      <TimeInput
        value={12}
        clockType={clockTypes.hours}
        pressed
        inputType={'picker'}
        onChanged={() => null}
      />
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
