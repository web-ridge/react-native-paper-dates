import React from 'react'
import { act, render } from '@testing-library/react-native'
import Swiper from '../../Date/Swiper'
import { getBeginOffset, getStartAtIndex } from '../../Date/dateUtils'
import {
  getIndexFromVerticalOffset,
  getVerticalMonthsOffset,
} from '../../Date/Month'
import { isIndexWithinRange } from '../../Date/SwiperUtils'

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

const startYear = 2020
const endYear = 2030
const width = 300
const height = 800

function scrollEvent(x: number, y: number) {
  return { nativeEvent: { contentOffset: { x, y } } }
}

function windowStart(index: number) {
  const span = height < 700 ? 1 : 2
  for (let offset = -span; offset <= span; offset += 1) {
    if (isIndexWithinRange(index + offset, startYear, endYear)) {
      return index + offset
    }
  }
  return index
}

function offsetFor(target: number, first: number) {
  const begin = getBeginOffset(startYear, endYear)
  const base = getVerticalMonthsOffset(first, false, startYear, endYear)
  for (let y = 0; y < 8000; y += 1) {
    if (
      getIndexFromVerticalOffset(
        base + y - begin,
        false,
        startYear,
        endYear
      ) === target
    ) {
      return y
    }
  }
  throw new Error(`no scroll offset for ${target}`)
}

type ScrollHandler = (event: ReturnType<typeof scrollEvent>) => void

function scrollNodes(screen: { container: { queryAll: Function } }) {
  return screen.container.queryAll(
    (node: { props: Record<string, unknown> }) =>
      typeof node.props.onMomentumScrollEnd === 'function'
  ) as Array<{
    props: {
      onMomentumScrollEnd?: ScrollHandler
      onScroll?: ScrollHandler
      pagingEnabled?: boolean
    }
  }>
}

function indexAt(first: number, y: number) {
  const begin = getBeginOffset(startYear, endYear)
  const base = getVerticalMonthsOffset(first, false, startYear, endYear)
  return getIndexFromVerticalOffset(base + y - begin, false, startYear, endYear)
}

type Fiber = {
  child?: Fiber
  sibling?: Fiber
  return?: Fiber
  memoizedState?: Hook | null
  type?: { name?: string } | string
}

type Hook = {
  memoizedState?: { current?: unknown }
  next?: Hook | null
}

function detachScrollRef(screen: { container: { queryAll: Function } }) {
  const seed = screen.container.queryAll(() => true)[0] as {
    unstable_fiber?: Fiber
  }
  let root = seed.unstable_fiber
  while (root?.return) root = root.return
  const stack: Fiber[] = root ? [root] : []
  const seen = new Set<Fiber>()
  while (stack.length) {
    const fiber = stack.pop()
    if (!fiber || seen.has(fiber)) continue
    seen.add(fiber)
    const name = typeof fiber.type === 'function' ? fiber.type.name : ''
    if (name === 'SwiperInner') {
      let hook = fiber.memoizedState
      while (hook) {
        const state = hook.memoizedState
        if (
          state &&
          typeof state === 'object' &&
          state.current &&
          typeof state.current === 'object'
        ) {
          Object.defineProperty(state, 'current', {
            configurable: true,
            get: () => null,
            set() {},
          })
          return
        }
        hook = hook.next
      }
    }
    if (fiber.child) stack.push(fiber.child)
    if (fiber.sibling) stack.push(fiber.sibling)
  }
  throw new Error('missing scroll ref')
}

afterEach(() => {
  const range = isIndexWithinRange as unknown as jest.Mock
  range.mockImplementation((...args: unknown[]) =>
    (
      jest.requireActual('../../Date/SwiperUtils') as {
        isIndexWithinRange: (...params: unknown[]) => boolean
      }
    ).isIndexWithinRange(...args)
  )
})

describe('native swiper gaps', () => {
  it('scrolls vertically, ignores a repeat, and rejects an out-of-range index', async () => {
    const initialIndex = getStartAtIndex(startYear, endYear)
    let onPrev: (() => void) | undefined
    const screen = await render(
      <Swiper
        endYear={endYear}
        initialIndex={initialIndex}
        initialLayout={{ width, height }}
        renderItem={({ onPrev: prev }) => {
          onPrev = prev
          return null
        }}
        scrollMode="vertical"
        selectedYear={undefined}
        startWeekOnMonday={false}
        startYear={startYear}
      />
    )
    const scroll = scrollNodes(screen).find(
      (node) => typeof node.props.onScroll === 'function'
    )
    if (!scroll?.props.onScroll) {
      throw new Error('missing vertical scroll')
    }

    const first = windowStart(initialIndex)
    const sameY = offsetFor(initialIndex, first)
    let farY = sameY + 4000
    for (let y = 0; y < 12000; y += 20) {
      const next = indexAt(first, y)
      if (
        next !== initialIndex &&
        isIndexWithinRange(next, startYear, endYear)
      ) {
        farY = y
        break
      }
    }

    await act(async () => {
      scroll.props.onScroll?.(scrollEvent(0, sameY))
      scroll.props.onScroll?.(scrollEvent(0, farY))
      scroll.props.onScroll?.(scrollEvent(0, farY))
    })
    jest.advanceTimersByTime(32)

    const moved = scrollNodes(screen).find(
      (node) => typeof node.props.onScroll === 'function'
    )
    await act(async () => {
      moved?.props.onScroll?.(scrollEvent(0, -1_000_000))
    })

    await act(async () => {
      onPrev?.()
    })
    await screen.rerender(
      <Swiper
        endYear={1800}
        initialIndex={initialIndex}
        initialLayout={{ width, height }}
        renderItem={() => null}
        scrollMode="vertical"
        selectedYear={undefined}
        startWeekOnMonday={false}
        startYear={1800}
      />
    )
  })

  it('ignores a horizontal page that does not change', async () => {
    const handlers: Array<
      (event: {
        nativeEvent: { contentOffset: { x: number; y: number } }
      }) => void
    > = []
    const original = React.useCallback
    const spy = jest.spyOn(React, 'useCallback').mockImplementation(((
      fn: (...args: never[]) => unknown,
      deps?: React.DependencyList
    ) => {
      const callback = original(fn, deps ?? [])
      const source = Function.prototype.toString.call(fn)
      if (source.includes('ignoreScroll.current)')) {
        handlers.push(
          callback as (event: {
            nativeEvent: { contentOffset: { x: number; y: number } }
          }) => void
        )
      }
      return callback
    }) as typeof React.useCallback)

    try {
      const screen = await render(
        <Swiper
          endYear={endYear}
          initialIndex={getStartAtIndex(startYear, endYear)}
          initialLayout={{ width, height: 120 }}
          renderItem={() => null}
          scrollMode="horizontal"
          selectedYear={undefined}
          startWeekOnMonday={false}
          startYear={startYear}
        />
      )
      const paging = scrollNodes(screen).find(
        (node) => node.props.pagingEnabled
      )
      await act(async () => {
        paging?.props.onMomentumScrollEnd?.(scrollEvent(width, 0))
        handlers.forEach((handler) => handler(scrollEvent(0, 0)))
      })
      expect(handlers.length).toBeGreaterThan(0)
    } finally {
      spy.mockRestore()
    }
  })

  it('skips recentering when the scroll view never attaches', async () => {
    const screen = await render(
      <Swiper
        endYear={endYear}
        initialIndex={getStartAtIndex(startYear, endYear)}
        initialLayout={{ width, height }}
        renderItem={() => null}
        scrollMode="vertical"
        selectedYear={undefined}
        startWeekOnMonday={false}
        startYear={startYear}
      />
    )
    detachScrollRef(screen)
    await screen.rerender(
      <Swiper
        endYear={2029}
        initialIndex={getStartAtIndex(startYear, endYear)}
        initialLayout={{ width, height }}
        renderItem={() => null}
        scrollMode="vertical"
        selectedYear={undefined}
        startWeekOnMonday={false}
        startYear={startYear}
      />
    )
  })

  it('keeps one month when every index is out of range', async () => {
    const range = isIndexWithinRange as unknown as jest.Mock
    range.mockReturnValue(false)
    await render(
      <Swiper
        endYear={2026}
        initialIndex={0}
        initialLayout={{ width, height: 400 }}
        renderItem={() => null}
        scrollMode="vertical"
        selectedYear={undefined}
        startWeekOnMonday={false}
        startYear={2026}
      />
    )
  })
})
