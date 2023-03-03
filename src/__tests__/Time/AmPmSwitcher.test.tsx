import * as React from 'react'

import renderer from 'react-test-renderer'
import { inputTypes } from '../../Time/timeUtils'
import AmPmSwitcher from '../../Time/AmPmSwitcher'

it('renders AmPmSwitcher', () => {
  const tree = renderer
    .create(
      <AmPmSwitcher
        hours={12}
        onChange={() => null}
        inputType={inputTypes.keyboard}
      />
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
