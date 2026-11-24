import { act, render } from '@testing-library/react-native'

import AnalogClock from '../../Time/AnalogClock'
import { installDateKeyListener } from '../../testUtils'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

it('renders AnalogClock', async () => {
  const { toJSON } = await render(
    <AnalogClock
      focused="hours"
      hours={12}
      is24Hour={false}
      minutes={30}
      onChange={() => null}
    />
  )

  expect(toJSON()).toMatchSnapshot()
})

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
