import * as React from 'react'

import renderer from 'react-test-renderer'
import AnalogClockHours from '../../Time/AnalogClockHours'

it('renders AnalogClockHours', () => {
  const tree = renderer
    .create(<AnalogClockHours is24Hour hours={12} />)
    .toJSON()

  expect(tree).toMatchSnapshot()
})
