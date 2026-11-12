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
        endYear={2028}
        initialIndex={getStartAtIndex(2024, 2028)}
        initialLayout={{ width: 280, height: 100 }}
        renderFooter={() => <Text>footer</Text>}
        renderHeader={onHeader}
        renderItem={({
          onNext,
          onPrev,
        }: {
          onNext: () => void
          onPrev: () => void
        }) => (
          <>
            <Pressable onPress={onPrev} testID="web-prev" />
            <Pressable onPress={onNext} testID="web-next" />
          </>
        )}
        scrollMode="horizontal"
        selectedYear={2027}
        startWeekOnMonday={false}
        startYear={2024}
      />
    )
    await pressNode(screen.getByTestId('web-prev'))
    await pressNode(screen.getByTestId('web-next'))
    expect(onHeader).toHaveBeenCalled()

    await render(
      <SwiperWeb
        endYear={2026}
        initialIndex={-20}
        initialLayout={{ width: 280, height: 700 }}
        renderItem={({ onPrev }: { onPrev: () => void }) => {
          onPrev()
          return <Text>month</Text>
        }}
        scrollMode="vertical"
        selectedYear={undefined}
        startWeekOnMonday
        startYear={2026}
      />
    )

    const vertical = await render(
      <ThemeProvider theme={{ ...DarkTheme, roundness: 4 }}>
      <SwiperWeb
        endYear={2030}
        initialIndex={getStartAtIndex(2020, 2030)}
        initialLayout={{ width: 280, height: 400 }}
        renderHeader={() => <Text>header</Text>}
        renderItem={() => <Text>month</Text>}
        scrollMode="vertical"
        selectedYear={undefined}
        startWeekOnMonday={false}
        startYear={2020}
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
        endYear={2026}
        initialIndex={0}
        initialLayout={{ width: 280, height: 100 }}
        renderItem={({
          onNext,
          onPrev,
        }: {
          onNext: () => void
          onPrev: () => void
        }) => (
          <>
            <Pressable onPress={onPrev} testID="edge-prev" />
            <Pressable onPress={onNext} testID="edge-next" />
          </>
        )}
        scrollMode="horizontal"
        selectedYear={2025}
        startWeekOnMonday={false}
        startYear={2026}
      />
    )
    await pressNode(edge.getByTestId('edge-prev'))
    await pressNode(edge.getByTestId('edge-next'))

    const atEnd = await render(
      <SwiperWeb
        endYear={2026}
        initialIndex={getMaxIndex(2026, 2026)}
        initialLayout={{ width: 280, height: 4000 }}
        renderItem={({ onNext }: { onNext: () => void }) => (
          <Pressable onPress={onNext} testID="end-next" />
        )}
        scrollMode="horizontal"
        selectedYear={undefined}
        startWeekOnMonday={false}
        startYear={2026}
      />
    )
    await pressNode(atEnd.getByTestId('end-next'))

    await render(
      <SwiperWeb
        endYear={2027}
        initialIndex={3}
        initialLayout={{ width: 280, height: 4000 }}
        renderHeader={() => <Text>header</Text>}
        renderItem={() => <Text>clamped</Text>}
        scrollMode="horizontal"
        selectedYear={2026}
        startWeekOnMonday={false}
        startYear={2027}
      />
    )

    await render(
      <SwiperWeb
        initialIndex={0}
        initialLayout={{ width: 280, height: 4000 }}
        renderItem={() => <Text>open</Text>}
        scrollMode="vertical"
        selectedYear={undefined}
        startWeekOnMonday={false}
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
