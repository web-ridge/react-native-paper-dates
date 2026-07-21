import { render } from '@testing-library/react-native'
import DayName from '../../Date/DayName'

it('renders DayName', async () => {
  const { toJSON } = await render(<DayName label="Monday" />)
  expect(toJSON()).toMatchSnapshot()
})
