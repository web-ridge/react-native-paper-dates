import * as React from 'react'

import renderer from 'react-test-renderer'
import CalendarEdit from '../../Date/CalendarEdit'

it('renders CalendarEdit', () => {
  const tree = renderer
    .create(
      <CalendarEdit
        mode={'single'}
        state={{
          startDate: new Date('01/01/2022'),
          endDate: new Date('01/01/2022'),
          date: new Date('01/01/2022'),
          dates: [new Date('01/01/2022')],
        }}
        collapsed={false}
        onChange={() => null}
        validRange={undefined}
        locale={'en'}
      />
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
