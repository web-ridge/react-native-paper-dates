import { render } from '@testing-library/react-native'
import Calendar from '../../Date/Calendar'

it('renders Calendar', () => {
  const { toJSON } = render(
    <Calendar
      locale="en"
      mode="single"
      date={new Date()}
      onChange={() => null}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
