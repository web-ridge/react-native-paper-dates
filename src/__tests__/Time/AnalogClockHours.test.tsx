import { render } from '@testing-library/react-native'
import AnalogClockHours from '../../Time/AnalogClockHours'

it('renders AnalogClockHours', async () => {
  const { toJSON } = await render(<AnalogClockHours is24Hour hours={12} />)

  expect(toJSON()).toMatchSnapshot()
})
