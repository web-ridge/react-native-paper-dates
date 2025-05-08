import { render } from '@testing-library/react-native'
import AnalogClockHours from '../../Time/AnalogClockHours'

it('renders AnalogClockHours', () => {
  const { toJSON } = render(<AnalogClockHours is24Hour hours={12} />)

  expect(toJSON()).toMatchSnapshot()
})
