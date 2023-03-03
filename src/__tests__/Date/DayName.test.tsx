import * as React from 'react'

import renderer from 'react-test-renderer'
import DayName from '../../Date/DayName'

it('renders DayName', () => {
  const tree = renderer.create(<DayName label={'Monday'} />).toJSON()

  expect(tree).toMatchSnapshot()
})
