import { render } from '@testing-library/react-native'
import TimeInputs from '../../Time/TimeInputs'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

it('renders TimeInputs', () => {
  const { toJSON } = render(
    <TimeInputs
      inputType="keyboard"
      hours={12}
      minutes={45}
      is24Hour
      locale="en"
      onChange={() => null}
      onFocusInput={() => null}
      focused="hours"
    />
  )

  expect(toJSON()).toMatchSnapshot()
})
