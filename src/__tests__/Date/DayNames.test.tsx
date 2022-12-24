import * as React from 'react'

import renderer from 'react-test-renderer'
import DayNames from '../../Date/DayNames'

it('renders DayNames', () => {
  const tree = renderer.create(<DayNames locale={'en'} />).toJSON()

  expect(tree).toMatchSnapshot()
})
