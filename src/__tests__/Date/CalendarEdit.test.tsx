import { render } from '@testing-library/react-native'
import CalendarEdit from '../../Date/CalendarEdit'

// 7th of August, 2025
const fixedDate = new Date(2025, 7, 7)

it('renders CalendarEdit', () => {
  const { toJSON } = render(
    <CalendarEdit
      mode="single"
      state={{
        startDate: fixedDate,
        endDate: fixedDate,
        date: fixedDate,
        dates: [fixedDate],
      }}
      collapsed={false}
      onChange={() => null}
      validRange={undefined}
      locale="en"
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
