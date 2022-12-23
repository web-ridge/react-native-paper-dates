import * as React from 'react'

import renderer from 'react-test-renderer'
import Calendar from '../../Date/Calendar'
import AnimatedCrossView from '../../Date/AnimatedCrossView'
import CalendarEdit from '../../Date/CalendarEdit'

it('renders collapsed AnimatedCrossView', () => {
  const tree = renderer
    .create(
      <AnimatedCrossView
        collapsed
        calendar={
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
        }
        calendarEdit={
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
        }
      />
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
