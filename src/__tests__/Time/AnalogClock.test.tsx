import { act, render } from '@testing-library/react-native'

import AnalogClock from '../../Time/AnalogClock'
import AnalogClockHours from '../../Time/AnalogClockHours'
import { installDateKeyListener } from '../../testUtils'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

it('rotates the dial with the arrow keys', async () => {
  const onChange = jest.fn()
  const keys = installDateKeyListener()
  try {
    const screen = await render(
      <AnalogClock
        focused="hours"
        hours={22}
        is24Hour
        minutes={58}
        onChange={onChange}
      />
    )
    await act(() => {
      screen.getByTestId('react-native-paper-dates-clock').props.onFocus?.({
        nativeEvent: { target: null },
      })
    })
    await keys.press('ArrowRight')
    expect(onChange).toHaveBeenCalledWith({ hours: 23, minutes: 58 })
    onChange.mockClear()
    await keys.press('ArrowLeft')
    expect(onChange).toHaveBeenCalledWith({ hours: 21, minutes: 58 })
    onChange.mockClear()

    const minutes = await render(
      <AnalogClock
        focused="minutes"
        hours={22}
        is24Hour
        minutes={58}
        onChange={onChange}
      />
    )
    await act(() => {
      minutes.getByTestId('react-native-paper-dates-clock').props.onFocus?.({
        nativeEvent: { target: null },
      })
    })
    await keys.press('ArrowDown')
    expect(onChange).toHaveBeenCalledWith({ hours: 22, minutes: 59 })
  } finally {
    keys.restore()
  }
})

it('says Hour 23 without a total on the 24-hour dial', async () => {
  const screen = await render(<AnalogClockHours hours={23} is24Hour />)
  expect(screen.getByLabelText('Hour 23')).toBeTruthy()
  expect(screen.queryByLabelText('Hour 23 of 24')).toBeNull()
  expect(screen.getByLabelText('Hour 0')).toBeTruthy()
})

it('keeps Hour of 12 wording on the 12-hour dial', async () => {
  const screen = await render(<AnalogClockHours hours={11} is24Hour={false} />)
  expect(screen.getByLabelText('Hour 11 of 12')).toBeTruthy()
})
