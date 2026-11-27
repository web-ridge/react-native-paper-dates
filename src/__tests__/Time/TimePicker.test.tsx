import { act, fireEvent, render } from '@testing-library/react-native'

import TimePicker, { TimePickerView } from '../../Time/TimePicker'
import { scrollFieldHeight, timeFieldSize } from '../../Time/timeUtils'
import TimePickerModal from '../../Time/TimePickerModal'
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
    height: 128,
  })
  expect(screen.getByTestId('time-scroll-minutes-control')).toHaveProp(
    'aria-invalid',
    true
  )
  expect(screen.getByTestId('time-scroll-minutes-control')).toHaveStyle({
    height: 128,
  })
  expect(screen.getByRole('radio', { name: 'AM' })).toHaveProp(
    'aria-invalid',
    true
  )
})

it('shows a consumer error on the dial fields', async () => {
  const screen = await render(
    <TimePickerView
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

it('does not render the dial and falls back to scroll when inputType is picker', async () => {
  const screen = await render(
    <TimePicker
      focused="hours"
      hours={8}
      // @ts-expect-error picker is not a valid inline input type
      inputType="picker"
      locale="en"
      minutes={0}
      onChange={() => null}
      onFocusInput={() => null}
    />
  )

  expect(
    screen.getByTestId('time-scroll-hours', { includeHiddenElements: true })
  ).toBeTruthy()
  expect(screen.queryByTestId('react-native-paper-dates-clock')).toBeNull()
})

it('keeps the dial in TimePickerModal and toggles to keyboard and back', async () => {
  const modal = await render(
    <TimePickerModal
      hours={9}
      locale="en"
      minutes={45}
      onConfirm={() => null}
      onDismiss={() => null}
      visible
    />
  )

  expect(modal.getByTestId('react-native-paper-dates-clock')).toBeTruthy()
  await fireEvent.press(modal.getByLabelText('Toggle input picker'))
  expect(modal.queryByTestId('react-native-paper-dates-clock')).toBeNull()
  expect(modal.getByLabelText('Hour')).toBeTruthy()
  await fireEvent.press(modal.getByLabelText('Toggle dial picker'))
  expect(modal.getByTestId('react-native-paper-dates-clock')).toBeTruthy()
})

it('grows scroll fields when the pane is wider than the minimum row', async () => {
  const screen = await render(
    <TimePicker
      focused="hours"
      hours={9}
      inputType="scroll"
      locale="en"
      minutes={45}
      onChange={() => null}
      onFocusInput={() => null}
      use24HourClock
    />
  )
  expect(screen.getByTestId('time-scroll-hours-control')).toHaveStyle({
    height: scrollFieldHeight,
  })

  await act(() => {
    screen.getByTestId('time-scroll-pane').props.onLayout({
      nativeEvent: { layout: { height: 200, width: 500, x: 0, y: 0 } },
    })
  })

  const grown = timeFieldSize({ availableWidth: 500, is24Hour: true })
  expect(screen.getByTestId('time-scroll-hours-control')).toHaveStyle({
    height: grown.height,
    width: grown.width,
  })
  expect(screen.getByTestId('time-scroll-minutes-control')).toHaveStyle({
    height: grown.height,
    width: grown.width,
  })
})
