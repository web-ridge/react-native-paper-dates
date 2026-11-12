import { render } from '@testing-library/react-native'
import CalendarEdit from '../../Date/CalendarEdit'

it('renders CalendarEdit', async () => {
  const fixedDate = new Date('2025-01-15')
  const { toJSON } = await render(
    <CalendarEdit
      collapsed={false}
      locale="en"
      mode="single"
      onChange={() => null}
      state={{
        startDate: fixedDate,
        endDate: fixedDate,
        date: fixedDate,
        dates: [fixedDate],
      }}
      validRange={undefined}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
