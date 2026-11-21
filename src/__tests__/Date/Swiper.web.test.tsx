import { act, render } from '@testing-library/react-native'
import type { ComponentType } from 'react'
import { Pressable, Text } from 'react-native'
import { DarkTheme, ThemeProvider } from 'react-native-paper'

import { getStartAtIndex } from '../../Date/dateUtils'
import { getVerticalMonthsOffset } from '../../Date/monthLayout'
import { getMaxIndex, isIndexWithinRange } from '../../Date/SwiperUtils'
import { pressNode } from '../../testUtils'

jest.mock('../../Date/SwiperUtils', () => {
  const actual = jest.requireActual('../../Date/SwiperUtils') as {
    isIndexWithinRange: (...args: unknown[]) => boolean
  }
  return {
    ...actual,
    isIndexWithinRange: jest.fn((...args: unknown[]) =>
      actual.isIndexWithinRange(...args)
    ),
  }
})

const originalWindow = globalThis.window

beforeAll(() => {
  globalThis.window = globalThis as typeof globalThis & Window
})

afterAll(() => {
  globalThis.window = originalWindow
})

describe('web swiper', () => {
  it('pages a horizontal and vertical scroller', async () => {
    const swiperModule = require('../../Date/Swiper.tsx') as {
      default: ComponentType<Record<string, unknown>>
    }

    const onHeader = jest.fn()
    const SwiperWeb = swiperModule.default
    const screen = await render(
      <SwiperWeb
        endYear={2028}
        initialIndex={getStartAtIndex(2024, 2028)}
        initialLayout={{ height: 100, width: 280 }}
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
        initialLayout={{ height: 700, width: 280 }}
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
          initialLayout={{ height: 400, width: 280 }}
          renderHeader={() => <Text>header</Text>}
          renderItem={() => <Text>month</Text>}
          scrollMode="vertical"
          selectedYear={undefined}
          startWeekOnMonday={false}
          startYear={2020}
        />
      </ThemeProvider>
    )
    const scrollers = vertical.container.queryAll(
      (node) => typeof node.props.onScroll === 'function'
    ) as unknown as Array<{
      props: {
        onScroll: (event: { currentTarget: { scrollTop?: number } }) => void
      }
    }>
    await act(async () => {
      scrollers.forEach((node) => {
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
        node.props.onScroll({ currentTarget: { scrollTop: 4000 } })
        node.props.onScroll({ currentTarget: {} })
      })
    })

    const edge = await render(
      <SwiperWeb
        endYear={2026}
        initialIndex={0}
        initialLayout={{ height: 100, width: 280 }}
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
        initialLayout={{ height: 4000, width: 280 }}
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
        initialLayout={{ height: 4000, width: 280 }}
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
        initialLayout={{ height: 4000, width: 280 }}
        renderItem={() => <Text>open</Text>}
        scrollMode="vertical"
        selectedYear={undefined}
        startWeekOnMonday={false}
      />
    )
  })

  it('loads the web scroller when window is missing', async () => {
    const previous = globalThis.window
    Reflect.deleteProperty(globalThis, 'window')
    try {
      jest.isolateModules(() => {
        require('../../Date/Swiper.tsx')
      })
    } finally {
      globalThis.window = previous
    }
  })

  it('keeps a single month when the visible window is out of range', async () => {
    const range = isIndexWithinRange as unknown as jest.Mock
    range.mockReturnValue(false)
    try {
      const SwiperWeb = (
        require('../../Date/Swiper.tsx') as {
          default: ComponentType<Record<string, unknown>>
        }
      ).default
      await render(
        <SwiperWeb
          endYear={2026}
          initialIndex={0}
          initialLayout={{ height: 400, width: 280 }}
          renderItem={() => <Text>placeholder</Text>}
          scrollMode="vertical"
          selectedYear={undefined}
          startWeekOnMonday={false}
          startYear={2026}
        />
      )
    } finally {
      range.mockImplementation((...args: unknown[]) =>
        (
          jest.requireActual('../../Date/SwiperUtils') as {
            isIndexWithinRange: (...params: unknown[]) => boolean
          }
        ).isIndexWithinRange(...args)
      )
    }
  })
})
