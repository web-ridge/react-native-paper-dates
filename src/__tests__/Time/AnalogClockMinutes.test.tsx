import { render } from '@testing-library/react-native'
import AnalogClockMinutes from '../../Time/AnalogClockMinutes'

it('renders AnalogClockMinutes', () => {
  const { toJSON } = render(<AnalogClockMinutes minutes={45} />)

  expect(toJSON()).toMatchSnapshot()
})
