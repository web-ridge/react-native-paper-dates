import { Animated } from 'react-native'
import { act, render } from '@testing-library/react-native'
import AnimatedCrossView from '../../Date/AnimatedCrossView'

it('renders AnimatedCrossView', async () => {
  const { toJSON } = await render(
    <AnimatedCrossView
      calendar={<></>}
      calendarEdit={<></>}
      collapsed={false}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})

it('finishes the crossfade in both directions', async () => {
  const callbacks: Array<(result: { finished: boolean }) => void> = []
  const timing = jest.spyOn(Animated, 'timing').mockImplementation(
    () =>
      ({
        start(callback?: (result: { finished: boolean }) => void) {
          if (callback) callbacks.push(callback)
        },
        stop() {},
        reset() {},
      }) as ReturnType<typeof Animated.timing>
  )

  try {
    const screen = await render(
      <AnimatedCrossView
        calendar={<></>}
        calendarEdit={<></>}
        collapsed={false}
      />
    )
    await screen.rerender(
      <AnimatedCrossView calendar={<></>} calendarEdit={<></>} collapsed />
    )
    await act(() => {
      callbacks[0]?.({ finished: false })
      callbacks[0]?.({ finished: true })
    })
    await screen.rerender(
      <AnimatedCrossView
        calendar={<></>}
        calendarEdit={<></>}
        collapsed={false}
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
