import * as React from 'react'

import renderer from 'react-test-renderer'
import DayRange from '../../Date/DayRange'

it('renders DayRange', () => {
  const tree = renderer
    .create(<DayRange inRange leftCrop rightCrop selectColor={'blue'} />)
    .toJSON()

  expect(tree).toMatchSnapshot()
})
