import { render } from '@testing-library/react-native'
import TimePicker from '../../Time/TimePicker'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

it('renders TimePicker', async () => {
  const { toJSON } = await render(
    <TimePicker
      locale="en"
      inputType="keyboard"
      focused="hours"
      hours={6}
      minutes={30}
      onChange={() => null}
      onFocusInput={() => null}
    />
  )

  expect(toJSON()).toMatchSnapshot()
})
