import * as React from 'react'

import renderer from 'react-test-renderer'
import TimeInputs from '../../Time/TimeInputs'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'
registerTranslation('en', en)

it('renders TimeInputs', () => {
  const tree = renderer
    .create(
      <TimeInputs
        inputType="keyboard"
        hours={12}
        minutes={45}
        is24Hour
        locale="en"
        onChange={() => null}
        onFocusInput={() => null}
        focused="hours"
      />
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
