import * as React from 'react'

import renderer from 'react-test-renderer'

import AnalogClock from '../../Time/AnalogClock'

it('renders AnalogClock', () => {
  const tree = renderer
    .create(
      <AnalogClock
        hours={12}
        minutes={30}
        focused="hours"
        is24Hour={false}
        onChange={() => null}
      />
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
