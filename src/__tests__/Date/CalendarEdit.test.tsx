import { render } from '@testing-library/react-native'
import CalendarEdit from '../../Date/CalendarEdit'

it('renders CalendarEdit', () => {
  const { toJSON } = render(
    <CalendarEdit
      mode="single"
      state={{
        startDate: new Date(),
        endDate: new Date(),
        date: new Date(),
        dates: [new Date()],
      }}
      collapsed={false}
      onChange={() => null}
      validRange={undefined}
      locale="en"
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
