import { render } from '@testing-library/react-native'

import AnalogClockHours from '../../Time/AnalogClockHours'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

it('renders AnalogClockHours', async () => {
  const { toJSON } = await render(<AnalogClockHours hours={12} is24Hour />)

  expect(toJSON()).toMatchSnapshot()
})
