import { render } from '@testing-library/react-native'
import CalendarEdit from '../../Date/CalendarEdit'

it('renders CalendarEdit', () => {
  const fixedDate = new Date('2025-01-15')
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
