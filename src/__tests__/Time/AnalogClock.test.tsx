import { render } from '@testing-library/react-native'

import AnalogClock from '../../Time/AnalogClock'

it('renders AnalogClock', () => {
  const { toJSON } = render(
    <AnalogClock
      hours={12}
      minutes={30}
      focused="hours"
      is24Hour={false}
      onChange={() => null}
    />
  )

  expect(toJSON()).toMatchSnapshot()
})
