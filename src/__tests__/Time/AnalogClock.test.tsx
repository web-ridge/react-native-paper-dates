import { render } from '@testing-library/react-native'

import AnalogClock from '../../Time/AnalogClock'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

it('renders AnalogClock', async () => {
  const { toJSON } = await render(
    <AnalogClock
      focused="hours"
      hours={12}
      is24Hour={false}
      minutes={30}
      onChange={() => null}
    />
  )

  expect(toJSON()).toMatchSnapshot()
})
