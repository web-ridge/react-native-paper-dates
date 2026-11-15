import { render } from '@testing-library/react-native'

import AnalogClockMinutes from '../../Time/AnalogClockMinutes'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

it('renders AnalogClockMinutes', async () => {
  const { toJSON } = await render(<AnalogClockMinutes minutes={45} />)

  expect(toJSON()).toMatchSnapshot()
})
