import { useTheme } from 'react-native-paper'
import {
  getIndexFromVerticalOffset,
  getMonthHeight,
  getVerticalListMetrics,
  getVerticalMonthScrollY,
  getVerticalMonthsOffset,
  horizontalMonthScrolls,
} from './Month'
import { getBeginOffset } from './dateUtils'
import { useLatest } from '../shared/utils'
import {
  RenderProps,
  SwiperProps,
  getMaxIndex,
  getMinIndex,
  getVerticalWindow,
  isIndexWithinRange,
  useYearChange,
  verticalWindowEdge,
} from './SwiperUtils'
import AutoSizer from './AutoSizer'
import {
  memo,
  UIEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { layoutScrollbarWidth } from './CalendarHeader'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

function Swiper({
  endYear,
  initialIndex,
  initialLayout,
  renderFooter,
  renderHeader,
  renderItem,
  scrollMode,
  selectedYear,
  startWeekOnMonday,
  startYear,
}: SwiperProps) {
  const isHorizontal = scrollMode === 'horizontal'

  const [index, setIndex] = useState(initialIndex)

  const onPrev = useCallback(() => {
    setIndex((prev) => {
      const newIndex = prev - 1
      if (isIndexWithinRange(newIndex, startYear, endYear)) {
        return newIndex
      }
      return prev
    })
  }, [setIndex, startYear, endYear])

  const onNext = useCallback(() => {
    setIndex((prev) => {
      const newIndex = prev + 1
      if (isIndexWithinRange(newIndex, startYear, endYear)) {
        return newIndex
      }
      return prev
    })
  }, [setIndex, startYear, endYear])

  const renderProps = {
    index,
    onPrev,
    onNext,
  }
  const indexRef = useLatest(index)
  useYearChange(
    (newIndex) => {
      if (newIndex && isIndexWithinRange(newIndex, startYear, endYear)) {
        setIndex(newIndex)
      }
    },
    {
      currentIndexRef: indexRef,
      endYear,
      selectedYear,
      startYear,
    }
  )

  return (
    <>
      {isHorizontal ? (
        <AutoSizer initialLayout={initialLayout}>
          {({ height }) => {
            const overflow = horizontalMonthScrolls(
              height,
              index,
              startWeekOnMonday,
              startYear,
              endYear
            )
            return (
              <>
                {renderItem({
                  index,
                  onPrev,
                  onNext,
                })}
                {renderHeader
                  ? renderHeader({
                      ...renderProps,
                      endInset: overflow ? layoutScrollbarWidth() : 0,
                    })
                  : null}
              </>
            )
          }}
        </AutoSizer>
      ) : (
        <>
          {renderHeader && renderHeader(renderProps)}
          <AutoSizer initialLayout={initialLayout}>
            {({ width, height }) => (
              <VerticalScroller
                endYear={endYear}
                height={height}
                initialIndex={initialIndex}
                renderItem={renderItem}
                startWeekOnMonday={startWeekOnMonday}
                startYear={startYear}
                width={width}
              />
            )}
          </AutoSizer>
        </>
      )}
      {renderFooter && renderFooter(renderProps)}
    </>
  )
}

function sameIndexes(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false
  }
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) {
      return false
    }
  }
  return true
}

function VerticalScroller({
  endYear,
  height,
  initialIndex,
  renderItem,
  startWeekOnMonday,
  startYear,
  width,
}: {
  endYear?: number
  height: number
  initialIndex: number
  renderItem: (renderProps: RenderProps) => any
  startWeekOnMonday: boolean
  startYear?: number
  width: number
}) {
  const effectiveStartYear = startYear || 1800
  const effectiveEndYear = endYear || 2200
  const constrainedInitialIndex = isIndexWithinRange(
    initialIndex,
    effectiveStartYear,
    effectiveEndYear
  )
    ? initialIndex
    : Math.max(
        Math.min(initialIndex, getMaxIndex(effectiveEndYear)),
        getMinIndex(effectiveStartYear)
      )

  const [visibleIndexes, setVisibleIndexes] = useState<number[]>(() =>
    getVerticalWindow(
      constrainedInitialIndex,
      effectiveStartYear,
      effectiveEndYear
    )
  )

  const theme = useTheme()
  const idx = useRef<number>(constrainedInitialIndex)
  const parentRef = useRef<HTMLDivElement | null>(null)
  const verticalMetrics = getVerticalListMetrics(
    getMinIndex(effectiveStartYear, effectiveEndYear),
    getMaxIndex(effectiveStartYear, effectiveEndYear),
    startWeekOnMonday,
    effectiveStartYear,
    effectiveEndYear
  )

  useIsomorphicLayoutEffect(() => {
    const element = parentRef.current
    if (!element) {
      return
    }
    element.scrollTo({
      top: getVerticalMonthScrollY(
        idx.current,
        verticalMetrics.origin,
        startWeekOnMonday,
        effectiveStartYear,
        effectiveEndYear
      ),
    })
    // Mount-only. Later scrolls keep the offset the user already has.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onScroll = useCallback(
    (e: UIEvent) => {
      const top = e.currentTarget?.scrollTop
      if (top === undefined) {
        return
      }

      const index = getIndexFromVerticalOffset(
        verticalMetrics.origin +
          top -
          getBeginOffset(effectiveStartYear, effectiveEndYear),
        startWeekOnMonday,
        effectiveStartYear,
        effectiveEndYear
      )

      if (
        !isIndexWithinRange(index, effectiveStartYear, effectiveEndYear) ||
        idx.current === index
      ) {
        return
      }

      idx.current = index
      const first = visibleIndexes[0]
      const last = visibleIndexes[visibleIndexes.length - 1]
      if (
        first === undefined ||
        last === undefined ||
        index - first <= verticalWindowEdge ||
        last - index <= verticalWindowEdge
      ) {
        const next = getVerticalWindow(
          index,
          effectiveStartYear,
          effectiveEndYear
        )
        setVisibleIndexes((current) =>
          sameIndexes(current, next) ? current : next
        )
      }
    },
    [
      effectiveEndYear,
      effectiveStartYear,
      startWeekOnMonday,
      verticalMetrics.origin,
      visibleIndexes,
    ]
  )

  return (
    <div
      onScroll={onScroll}
      ref={parentRef}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        colorScheme: theme.dark ? 'dark' : 'light',
        height,
        overflow: 'auto',
        overflowAnchor: 'none',
        width,
      }}
    >
      <div
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          height: verticalMetrics.height,
          position: 'relative',
        }}
      >
        {visibleIndexes.map((monthIndex) => {
          return (
            <div
              key={monthIndex}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                height: getMonthHeight(
                  'vertical',
                  monthIndex,
                  startWeekOnMonday,
                  effectiveStartYear,
                  effectiveEndYear
                ),
                left: 0,
                position: 'absolute',
                right: 0,
                transform: `translateY(${
                  getVerticalMonthsOffset(
                    monthIndex,
                    startWeekOnMonday,
                    effectiveStartYear,
                    effectiveEndYear
                  ) - verticalMetrics.origin
                }px)`,
                willChange: 'transform',
              }}
            >
              {renderItem({
                index: monthIndex,
                onPrev: empty,
                onNext: empty,
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const empty = () => null

export function useDebouncedCallback(callback: any): any {
  const mounted = useRef<boolean>(true)
  const timerId = useRef<any>(null)
  const latest = useLatest(callback)

  useEffect(() => {
    return () => {
      mounted.current = false
      if (timerId.current) {
        window.cancelAnimationFrame(timerId.current)
      }
    }
  }, [mounted, timerId])

  return useCallback(
    (args: any) => {
      if (timerId.current) {
        window.cancelAnimationFrame(timerId.current)
      }
      timerId.current = window.requestAnimationFrame(function () {
        if (mounted.current) {
          latest.current(args)
        }
      })
    },
    [mounted, timerId, latest]
  )
}

export default memo(Swiper)
