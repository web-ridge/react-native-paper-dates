import { render } from '@testing-library/react-native'
import DayNames from '../../Date/DayNames'

it('renders DayNames', () => {
  const { toJSON } = render(<DayNames locale="en" startWeekOnMonday={false} />)
  expect(toJSON()).toMatchSnapshot()
})
