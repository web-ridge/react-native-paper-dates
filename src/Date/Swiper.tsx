import { useTheme } from 'react-native-paper'
import {
  getIndexFromVerticalOffset,
  getLocalMonthOffset,
  getMonthHeight,
  getVerticalMonthsOffset,
  getVisibleMonthsHeight,
  horizontalMonthScrolls,
  montHeaderHeight,
} from './Month'
import { getBeginOffset } from './dateUtils'
import { useLatest } from '../shared/utils'
import {
  RenderProps,
  SwiperProps,
  getMaxIndex,
  getMinIndex,
  isIndexWithinRange,
  useYearChange,
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

const visibleArray = (i: number, startYear?: number, endYear?: number) => {
  const indexes: number[] = []
  for (let offset = -2; offset <= 2; offset += 1) {
    const index = i + offset
    if (isIndexWithinRange(index, startYear, endYear)) {
      indexes.push(index)
    }
  }
  return indexes.length ? indexes : [i]
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
    visibleArray(constrainedInitialIndex, effectiveStartYear, effectiveEndYear)
  )

  const theme = useTheme()
  const idx = useRef<number>(constrainedInitialIndex)
  const parentRef = useRef<HTMLDivElement | null>(null)

  useIsomorphicLayoutEffect(() => {
    const element = parentRef.current as HTMLDivElement
    const top =
      getLocalMonthOffset(
        visibleIndexes,
        idx.current,
        startWeekOnMonday,
        effectiveStartYear,
        effectiveEndYear
      ) - montHeaderHeight

    element.scrollTo({
      top,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentRef, idx])

  const setVisibleIndexesThrottled = useDebouncedCallback(setVisibleIndexes)

  const onScroll = useCallback(
    (e: UIEvent) => {
      const top = e.currentTarget?.scrollTop
      if (top === undefined) {
        return
      }

      const absY =
        getVerticalMonthsOffset(
          visibleIndexes[0],
          startWeekOnMonday,
          effectiveStartYear,
          effectiveEndYear
        ) + top
      const index = getIndexFromVerticalOffset(
        absY - getBeginOffset(effectiveStartYear, effectiveEndYear),
        startWeekOnMonday,
        effectiveStartYear,
        effectiveEndYear
      )

      if (!isIndexWithinRange(index, effectiveStartYear, effectiveEndYear)) {
        return
      }

      if (idx.current !== index) {
        const nextVisible = visibleArray(
          index,
          effectiveStartYear,
          effectiveEndYear
        )
        const nextTop =
          absY -
          getVerticalMonthsOffset(
            nextVisible[0],
            startWeekOnMonday,
            effectiveStartYear,
            effectiveEndYear
          )
        idx.current = index
        setVisibleIndexesThrottled(nextVisible)
        parentRef.current?.scrollTo({ top: nextTop })
      }
    },
    [
      effectiveEndYear,
      effectiveStartYear,
      setVisibleIndexesThrottled,
      startWeekOnMonday,
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
        width,
      }}
    >
      <div
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          height: getVisibleMonthsHeight(
            visibleIndexes,
            startWeekOnMonday,
            effectiveStartYear,
            effectiveEndYear
          ),
          position: 'relative',
        }}
      >
        {visibleIndexes.map((monthIndex, vi) => {
          return (
            <div
              key={vi}
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
                transform: `translateY(${getLocalMonthOffset(
                  visibleIndexes,
                  monthIndex,
                  startWeekOnMonday,
                  effectiveStartYear,
                  effectiveEndYear
                )}px)`,
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
