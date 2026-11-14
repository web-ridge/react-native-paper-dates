import { render } from '@testing-library/react-native'
import TimePicker from '../../Time/TimePicker'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

it('renders TimePicker', async () => {
  const { toJSON } = await render(
    <TimePicker
      focused="hours"
      hours={6}
      inputType="keyboard"
      locale="en"
      minutes={30}
      onChange={() => null}
      onFocusInput={() => null}
    />
  )

  expect(toJSON()).toMatchSnapshot()
})

it('follows a later hours value onto PM', async () => {
  const view = await render(
    <TimePicker
      focused="hours"
      hours={8}
      inputType="keyboard"
      locale="en"
      minutes={0}
      onChange={() => null}
      onFocusInput={() => null}
      use24HourClock={false}
    />
  )
  expect(view.getByLabelText('AM')).toHaveProp(
    'accessibilityState',
    expect.objectContaining({ disabled: true, selected: true })
  )

  await view.rerender(
    <TimePicker
      focused="hours"
      hours={15}
      inputType="keyboard"
      locale="en"
      minutes={0}
      onChange={() => null}
      onFocusInput={() => null}
      use24HourClock={false}
    />
  )
  expect(view.getByLabelText('PM')).toHaveProp(
    'accessibilityState',
    expect.objectContaining({ disabled: true, selected: true })
  )
})
