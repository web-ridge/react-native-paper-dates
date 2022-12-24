import * as React from 'react'

import renderer from 'react-test-renderer'
import AnalogClockMinutes from '../../Time/AnalogClockMinutes'

it('renders AnalogClockMinutes', () => {
  const tree = renderer.create(<AnalogClockMinutes minutes={45} />).toJSON()

  expect(tree).toMatchSnapshot()
})
