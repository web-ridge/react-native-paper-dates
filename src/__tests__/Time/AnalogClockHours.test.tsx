import { render } from '@testing-library/react-native'
import AnalogClockHours from '../../Time/AnalogClockHours'

it('renders AnalogClockHours', async () => {
  const { toJSON } = await render(<AnalogClockHours hours={12} is24Hour />)

  expect(toJSON()).toMatchSnapshot()
})
