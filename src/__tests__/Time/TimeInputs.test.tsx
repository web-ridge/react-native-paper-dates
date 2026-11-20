import { fireEvent, render } from '@testing-library/react-native'

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

it('labels each keyboard field with an Hour / Minute caption', async () => {
  const screen = await render(
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

  expect(screen.getByText('Hour', { includeHiddenElements: true })).toBeTruthy()
  expect(
    screen.getByText('Minute', { includeHiddenElements: true })
  ).toBeTruthy()
})

it('replaces the captions with the error when the time is invalid', async () => {
  const screen = await render(
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

  const hour = screen.getByLabelText('Hour')
  await fireEvent(hour, 'focus')
  await fireEvent.changeText(hour, '99')

  expect(screen.getByText('Invalid time')).toBeTruthy()
  expect(screen.queryByText('Hour', { includeHiddenElements: true })).toBeNull()
  expect(
    screen.queryByText('Minute', { includeHiddenElements: true })
  ).toBeNull()
})

it('has no captions outside keyboard mode', async () => {
  const screen = await render(
    <TimeInputs
      focused="hours"
      hours={12}
      inputType="picker"
      is24Hour
      locale="en"
      minutes={45}
      onChange={() => null}
      onFocusInput={() => null}
    />
  )

  expect(screen.queryByText('Hour', { includeHiddenElements: true })).toBeNull()
})
