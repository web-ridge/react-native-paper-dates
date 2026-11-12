import { render } from '@testing-library/react-native'
import TimeInput from '../../Time/TimeInput'
import { clockTypes } from '../../Time/timeUtils'

it('renders TimeInput', async () => {
  const { toJSON } = await render(
    <TimeInput
      clockType={clockTypes.hours}
      inputType={'picker'}
      onChanged={() => null}
      pressed
      value={12}
    />
  )

  expect(toJSON()).toMatchSnapshot()
})
