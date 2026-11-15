import { act, render } from '@testing-library/react-native'
import { Animated } from 'react-native'

import AnalogClockHours from '../../Time/AnalogClockHours'
import AnalogClockMinutes from '../../Time/AnalogClockMinutes'
import AnimatedClockSwitcher from '../../Time/AnimatedClockSwitcher'

it('finishes the clock crossfade in both directions', async () => {
  const callbacks: Array<(result: { finished: boolean }) => void> = []
  const hours = <AnalogClockHours hours={1} is24Hour={false} />
  const minutes = <AnalogClockMinutes minutes={5} />
  const timing = jest.spyOn(Animated, 'timing').mockImplementation(
    () =>
      ({
        reset() {},
        start(callback?: (result: { finished: boolean }) => void) {
          if (callback) callbacks.push(callback)
        },
        stop() {},
      }) as ReturnType<typeof Animated.timing>
  )

  try {
    const screen = await render(
      <AnimatedClockSwitcher
        focused="minutes"
        hours={hours}
        minutes={minutes}
      />
    )
    await screen.rerender(
      <AnimatedClockSwitcher focused="hours" hours={hours} minutes={minutes} />
    )
    await act(() => {
      callbacks[0]?.({ finished: false })
      callbacks[0]?.({ finished: true })
    })
    await screen.rerender(
      <AnimatedClockSwitcher
        focused="minutes"
        hours={hours}
        minutes={minutes}
      />
    )
    await act(() => {
      callbacks.at(-1)?.({ finished: true })
    })
    expect(callbacks.length).toBeGreaterThan(1)
  } finally {
    timing.mockRestore()
  }
})
