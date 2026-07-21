import { render } from '@testing-library/react-native'
import DayNames from '../../Date/DayNames'

it('renders DayNames', async () => {
  const { toJSON } = await render(
    <DayNames locale="en" startWeekOnMonday={false} />
  )
  expect(toJSON()).toMatchSnapshot()
})
