import { render } from '@testing-library/react-native'
import Calendar from '../../Date/Calendar'

it('renders Calendar', () => {
  const fixedDate = new Date('2025-01-15')
  const { toJSON } = render(
    <Calendar
      locale="en"
      mode="single"
      date={fixedDate}
      onChange={() => null}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
