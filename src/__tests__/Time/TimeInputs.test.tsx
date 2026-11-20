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

it('shows no Hour / Minute captions in keyboard mode (M3 Expressive)', async () => {
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

  expect(screen.queryByText('Hour', { includeHiddenElements: true })).toBeNull()
  expect(
    screen.queryByText('Minute', { includeHiddenElements: true })
  ).toBeNull()
  // Fields stay labelled for assistive tech.
  expect(screen.getByLabelText('Hour')).toBeTruthy()
  expect(screen.getByLabelText('Minute')).toBeTruthy()
})

it('shows the error text below the fields when the time is invalid', async () => {
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

it('does not move the focused field when AM or PM is pressed', async () => {
  const onChange = jest.fn()
  const screen = await render(
    <TimeInputs
      focused="minutes"
      hours={9}
      inputType="keyboard"
      is24Hour={false}
      locale="en"
      minutes={45}
      onChange={onChange}
      onFocusInput={() => null}
    />
  )

  await fireEvent.press(screen.getByLabelText('PM'))

  expect(onChange).toHaveBeenCalledWith({ hours: 21, minutes: 45 })
  expect(onChange.mock.calls[0][0].focused).toBeUndefined()
})
