import { render } from '@testing-library/react-native'
import AnalogClockMinutes from '../../Time/AnalogClockMinutes'

it('renders AnalogClockMinutes', async () => {
  const { toJSON } = await render(<AnalogClockMinutes minutes={45} />)

  expect(toJSON()).toMatchSnapshot()
})
