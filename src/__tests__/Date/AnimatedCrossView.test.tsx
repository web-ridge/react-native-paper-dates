import { act, render } from '@testing-library/react-native'
import { Animated, StyleSheet, Text } from 'react-native'
import { LightTheme, ThemeProvider } from 'react-native-paper'

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
        reset() {},
        start(callback?: (result: { finished: boolean }) => void) {
          if (callback) callbacks.push(callback)
        },
        stop() {},
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

it('drops the scale and swaps at once under Reduce Motion', async () => {
  const durations: number[] = []
  const timing = Animated.timing.bind(Animated)
  const spy = jest
    .spyOn(Animated, 'timing')
    .mockImplementation((value, config) => {
      durations.push(config.duration ?? -1)
      return timing(value, config)
    })
  const theme = {
    ...LightTheme,
    animation: { ...LightTheme.animation, scale: 0 },
  }
  const view = (collapsed: boolean) => (
    <ThemeProvider theme={theme}>
      <AnimatedCrossView
        calendar={<Text>calendar</Text>}
        calendarEdit={<Text>edit</Text>}
        collapsed={collapsed}
      />
    </ThemeProvider>
  )
  type Node = { parent: Node | null; props: { style?: unknown } }
  const layerStyle = (node: Node) => {
    let current: Node | null = node
    while (current) {
      const flat = StyleSheet.flatten(current.props.style as never) as {
        opacity?: unknown
        transform?: unknown
      } | null
      if (flat && 'opacity' in flat) return flat
      current = current.parent
    }
    throw new Error('no cross-fade layer')
  }
  try {
    const screen = await render(view(false))
    await screen.rerender(view(true))
    await act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(durations).toEqual([0])
    expect(screen.queryByText('edit')).toBeNull()
    const calendar = screen.getByText('calendar') as unknown as Node
    expect(layerStyle(calendar).transform).toBeUndefined()
  } finally {
    spy.mockRestore()
  }
})
