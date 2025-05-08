import { render } from '@testing-library/react-native'
import DayName from '../../Date/DayName'

it('renders DayName', () => {
  const { toJSON } = render(<DayName label="Monday" />)
  expect(toJSON()).toMatchSnapshot()
})
