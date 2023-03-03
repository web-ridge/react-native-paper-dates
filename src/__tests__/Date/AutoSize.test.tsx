import * as React from 'react'

import renderer from 'react-test-renderer'
import AutoSizer from '../../Date/AutoSizer'

it('renders AutoSizer', () => {
  const tree = renderer.create(<AutoSizer>{() => <></>}</AutoSizer>).toJSON()

  expect(tree).toMatchSnapshot()
})
