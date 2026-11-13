import { render } from '@testing-library/react-native'
import TimeInputs from '../../Time/TimeInputs'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

it('renders TimeInputs', async () => {
  const { toJSON } = await render(
    <TimeInputs
      focused="hours"
      hours={12}
      inputType="keyboard"
      is24Hour
      locale="en"
      minutes={45}
      onChange={() => null}
      onFocusInput={() => null}
    />
  )

  expect(toJSON()).toMatchSnapshot()
})
