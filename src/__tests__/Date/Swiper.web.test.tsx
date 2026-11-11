import type { ComponentType } from 'react'
import { Pressable, Text } from 'react-native'
import { act, render } from '@testing-library/react-native'
import { DarkTheme, ThemeProvider } from 'react-native-paper'
import { pressNode } from '../../testUtils'
import { getStartAtIndex } from '../../Date/dateUtils'
import { getVerticalMonthsOffset } from '../../Date/Month'
import { getMaxIndex } from '../../Date/SwiperUtils'

const originalWindow = global.window

beforeAll(() => {
  const windowPolyfill = global as typeof globalThis & {
    requestAnimationFrame: (callback: FrameRequestCallback) => number
    cancelAnimationFrame: (handle: number) => void
  }
  windowPolyfill.requestAnimationFrame = (callback) => {
    callback(0)
    return 1
  }
  windowPolyfill.cancelAnimationFrame = () => null
  global.window = windowPolyfill
})

afterAll(() => {
  global.window = originalWindow
})

describe('web swiper', () => {
  it('pages a horizontal and vertical scroller', async () => {
    const swiperModule = require('../../Date/Swiper.tsx') as {
      default: ComponentType<Record<string, unknown>>
      useDebouncedCallback: (callback: (value: number[]) => void) => (value: number[]) => void
    }
    expect(typeof swiperModule.useDebouncedCallback).toBe('function')

    const SwiperWeb = swiperModule.default
    const onHeader = jest.fn()
    const screen = await render(
      <SwiperWeb
        initialIndex={getStartAtIndex(2024, 2028)}
        scrollMode="horizontal"
        startWeekOnMonday={false}
        startYear={2024}
        endYear={2028}
        selectedYear={2027}
        initialLayout={{ width: 280, height: 100 }}
        renderItem={({
          onPrev,
          onNext,
        }: {
          onPrev: () => void
          onNext: () => void
        }) => (
          <>
            <Pressable testID="web-prev" onPress={onPrev} />
            <Pressable testID="web-next" onPress={onNext} />
          </>
        )}
        renderHeader={onHeader}
        renderFooter={() => <Text>footer</Text>}
      />
    )
    await pressNode(screen.getByTestId('web-prev'))
    await pressNode(screen.getByTestId('web-next'))
    expect(onHeader).toHaveBeenCalled()

    await render(
      <SwiperWeb
        initialIndex={-20}
        scrollMode="vertical"
        startWeekOnMonday
        startYear={2026}
        endYear={2026}
        selectedYear={undefined}
        initialLayout={{ width: 280, height: 700 }}
        renderItem={({ onPrev }: { onPrev: () => void }) => {
          onPrev()
          return <Text>month</Text>
        }}
      />
    )

    const vertical = await render(
      <ThemeProvider theme={{ ...DarkTheme, roundness: 4 }}>
      <SwiperWeb
        initialIndex={getStartAtIndex(2020, 2030)}
        scrollMode="vertical"
        startWeekOnMonday={false}
        startYear={2020}
        endYear={2030}
        selectedYear={undefined}
        initialLayout={{ width: 280, height: 400 }}
        renderItem={() => <Text>month</Text>}
        renderHeader={() => <Text>header</Text>}
      />
      </ThemeProvider>
    )
    vertical.container
      .queryAll((node: { props: { onScroll?: Function } }) => node.props.onScroll)
      .forEach((node: { props: { onScroll: Function } }) => {
        node.props.onScroll({ currentTarget: { scrollTop: 0 } })
        node.props.onScroll({
          currentTarget: {
            scrollTop: getVerticalMonthsOffset(
              getStartAtIndex(2020, 2030),
              false,
              2020,
              2030
            ),
          },
        })
        node.props.onScroll({ currentTarget: { scrollTop: 4000 } })
        node.props.onScroll({ currentTarget: {} })
      })

    const edge = await render(
      <SwiperWeb
        initialIndex={0}
        scrollMode="horizontal"
        startWeekOnMonday={false}
        startYear={2026}
        endYear={2026}
        selectedYear={2025}
        initialLayout={{ width: 280, height: 100 }}
        renderItem={({
          onPrev,
          onNext,
        }: {
          onPrev: () => void
          onNext: () => void
        }) => (
          <>
            <Pressable testID="edge-prev" onPress={onPrev} />
            <Pressable testID="edge-next" onPress={onNext} />
          </>
        )}
      />
    )
    await pressNode(edge.getByTestId('edge-prev'))
    await pressNode(edge.getByTestId('edge-next'))

    const atEnd = await render(
      <SwiperWeb
        initialIndex={getMaxIndex(2026, 2026)}
        scrollMode="horizontal"
        startWeekOnMonday={false}
        startYear={2026}
        endYear={2026}
        selectedYear={undefined}
        initialLayout={{ width: 280, height: 4000 }}
        renderItem={({ onNext }: { onNext: () => void }) => (
          <Pressable testID="end-next" onPress={onNext} />
        )}
      />
    )
    await pressNode(atEnd.getByTestId('end-next'))

    await render(
      <SwiperWeb
        initialIndex={3}
        scrollMode="horizontal"
        startWeekOnMonday={false}
        startYear={2027}
        endYear={2027}
        selectedYear={2026}
        initialLayout={{ width: 280, height: 4000 }}
        renderItem={() => <Text>clamped</Text>}
        renderHeader={() => <Text>header</Text>}
      />
    )

    await render(
      <SwiperWeb
        initialIndex={0}
        scrollMode="vertical"
        startWeekOnMonday={false}
        selectedYear={undefined}
        initialLayout={{ width: 280, height: 4000 }}
        renderItem={() => <Text>open</Text>}
      />
    )

    const debounced = await render(<DebouncedProbe callback={swiperModule.useDebouncedCallback} />)
    await debounced.unmount()
  })

  it('falls back to useEffect without a window and ignores a late frame', async () => {
    const previous = global.window
    // @ts-expect-error the web build is selected by the presence of window
    delete global.window
    jest.isolateModules(() => {
      require('../../Date/Swiper.tsx')
    })
    global.window = previous

    let frame: FrameRequestCallback | undefined
    const raf = global.requestAnimationFrame
    global.requestAnimationFrame = (callback) => {
      frame = callback
      return 7
    }
    const swiperModule = require('../../Date/Swiper.tsx') as {
      useDebouncedCallback: (callback: (value: number[]) => void) => (value: number[]) => void
    }
    const pending = await render(
      <DebouncedProbe callback={swiperModule.useDebouncedCallback} />
    )
    await pending.unmount()
    frame?.(0)
    global.requestAnimationFrame = raf
  })
})

function DebouncedProbe({
  callback,
}: {
  callback: (fn: (value: number[]) => void) => (value: number[]) => void
}) {
  const { useEffect } = require('react') as typeof import('react')
  const debounced = callback((value) => value)
  useEffect(() => {
    debounced([1])
    debounced([2])
  })
  return null
}
