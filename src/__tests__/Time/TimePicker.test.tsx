import * as React from 'react'

import renderer from 'react-test-renderer'
import TimePicker from '../../Time/TimePicker'

it('renders TimePicker', () => {
  const tree = renderer
    .create(
      <TimePicker
        locale="en"
        inputType="keyboard"
        focused="hours"
        hours={6}
        minutes={30}
        onChange={() => null}
        onFocusInput={() => null}
      />
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
