import * as React from 'react'

import renderer from 'react-test-renderer'
import AmPmSwitcher from '../../Time/AmPmSwitcher'

it('renders AmPmSwitcher', () => {
  const tree = renderer
    .create(<AmPmSwitcher hours={12} onChange={() => null} />)
    .toJSON()

  expect(tree).toMatchSnapshot()
})
