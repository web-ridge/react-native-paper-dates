import * as React from 'react'

import renderer from 'react-test-renderer'
import CalendarHeader from '../../Date/CalendarHeader'

it('renders CalendarHeader', () => {
  const tree = renderer
    .create(
      <CalendarHeader
        locale={'en'}
        onPrev={() => null}
        onNext={() => null}
        scrollMode={'vertical'}
      />
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
