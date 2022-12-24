import * as React from 'react'

import renderer from 'react-test-renderer'
import Calendar from '../../Date/Calendar'

it('renders Calendar', () => {
  const tree = renderer
    .create(
      <Calendar
        locale="en"
        mode={'single'}
        startDate={new Date('01/01/2022')}
        endDate={new Date('01/01/2022')}
        date={new Date('01/01/2022')}
        onChange={() => null}
        dates={[]}
        dateMode={'start'}
      />
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
