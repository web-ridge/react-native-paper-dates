import { render } from '@testing-library/react-native'
import TimeInput from '../../Time/TimeInput'
import { clockTypes } from '../../Time/timeUtils'

it('renders TimeInput', async () => {
  const { toJSON } = await render(
    <TimeInput
      value={12}
      clockType={clockTypes.hours}
      pressed
      inputType={'picker'}
      onChanged={() => null}
    />
  )

  expect(toJSON()).toMatchSnapshot()
})
