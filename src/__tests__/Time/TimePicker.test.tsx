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
    expect.objectContaining({ selected: true })
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
    expect.objectContaining({ selected: true })
  )
})

it('shows a consumer error on the scroll wheels', async () => {
  const screen = await render(
    <TimePicker
      error
      errorText="Choose a time from 9:00 AM"
      focused="hours"
      hours={8}
      inputType="scroll"
      locale="en"
      minutes={0}
      onChange={() => null}
      onFocusInput={() => null}
    />
  )

  expect(screen.getByText('Choose a time from 9:00 AM')).toBeTruthy()
  expect(screen.getByTestId('time-scroll-hours-control')).toHaveProp(
    'aria-invalid',
    true
  )
  expect(screen.getByTestId('time-scroll-hours-control')).toHaveStyle({
    height: 120,
  })
  expect(screen.getByTestId('time-scroll-minutes-control')).toHaveProp(
    'aria-invalid',
    true
  )
  expect(screen.getByTestId('time-scroll-minutes-control')).toHaveStyle({
    height: 120,
  })
  expect(screen.getByRole('radio', { name: 'AM' })).toHaveProp(
    'aria-invalid',
    true
  )
})

it('shows a consumer error on the dial fields', async () => {
  const screen = await render(
    <TimePicker
      error
      errorText="Choose a time from 9:00 AM"
      focused="hours"
      hours={8}
      inputType="picker"
      locale="en"
      minutes={0}
      onChange={() => null}
      onFocusInput={() => null}
    />
  )

  expect(screen.getByText('Choose a time from 9:00 AM')).toBeTruthy()
  expect(screen.getByLabelText('Hour')).toHaveProp('aria-invalid', true)
})
