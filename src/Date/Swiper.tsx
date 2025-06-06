import { View } from 'react-native'
import {
  getIndexFromVerticalOffset,
  getMonthHeight,
  getVerticalMonthsOffset,
  montHeaderHeight,
} from './Month'
import { beginOffset, estimatedMonthHeight, totalMonths } from './dateUtils'
import { useLatest } from '../shared/utils'
import {
  RenderProps,
  SwiperProps,
  useYearChange,
  isIndexWithinRange,
  getMinIndex,
  getMaxIndex,
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
import { sharedStyles } from '../shared/styles'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

function Swiper({
  scrollMode,
  renderItem,
  renderHeader,
  renderFooter,
  selectedYear,
  initialIndex,
  startWeekOnMonday,
  startYear,
  endYear,
}: SwiperProps) {
  const isHorizontal = scrollMode === 'horizontal'

  const [index, setIndex] = useState(initialIndex)

  const onPrev = useCallback(() => {
    setIndex((prev) => {
      const newIndex = prev - 1
      // Check if the new index is within allowed range
      if (isIndexWithinRange(newIndex, startYear, endYear)) {
        return newIndex
      }
      return prev // Don't change if outside range
    })
  }, [setIndex, startYear, endYear])

  const onNext = useCallback(() => {
    setIndex((prev) => {
      const newIndex = prev + 1
      // Check if the new index is within allowed range
      if (isIndexWithinRange(newIndex, startYear, endYear)) {
        return newIndex
      }
      return prev // Don't change if outside range
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
      selectedYear,
      currentIndexRef: indexRef,
      startYear,
      endYear,
    }
  )

  return (
    <>
      {renderHeader && renderHeader(renderProps)}
      {isHorizontal ? (
        <View style={sharedStyles.root}>
          {renderItem({ index, onPrev, onNext })}
        </View>
      ) : (
        <AutoSizer>
          {({ width, height }) => (
            <VerticalScroller
              width={width}
              height={height}
              initialIndex={initialIndex}
              estimatedHeight={estimatedMonthHeight}
              renderItem={renderItem}
              startWeekOnMonday={startWeekOnMonday}
              startYear={startYear}
              endYear={endYear}
            />
          )}
        </AutoSizer>
      )}
      {renderFooter && renderFooter(renderProps)}
    </>
  )
}

const visibleArray = (i: number) => [i - 2, i - 1, i, i + 1, i + 2]

function VerticalScroller({
  width,
  height,
  initialIndex,
  estimatedHeight,
  renderItem,
  startWeekOnMonday,
  startYear,
  endYear,
}: {
  renderItem: (renderProps: RenderProps) => any
  width: number
  height: number
  initialIndex: number
  estimatedHeight: number
  startWeekOnMonday: boolean
  startYear?: number
  endYear?: number
}) {
  // Ensure initial index is within allowed range
  const constrainedInitialIndex = isIndexWithinRange(
    initialIndex,
    startYear,
    endYear
  )
    ? initialIndex
    : Math.max(
        Math.min(initialIndex, getMaxIndex(endYear)),
        getMinIndex(startYear)
      )

  const [visibleIndexes, setVisibleIndexes] = useState<number[]>(
    visibleArray(constrainedInitialIndex)
  )

  const idx = useRef<number>(constrainedInitialIndex)
  const parentRef = useRef<HTMLDivElement | null>(null)

  useIsomorphicLayoutEffect(() => {
    const element = parentRef.current
    if (!element) {
      return
    }
    const top =
      getVerticalMonthsOffset(idx.current, startWeekOnMonday) - montHeaderHeight

    element.scrollTo({
      top,
    })
  }, [parentRef, idx])

  const setVisibleIndexesThrottled = useDebouncedCallback(setVisibleIndexes)

  const onScroll = useCallback(
    (e: UIEvent) => {
      const top = e.currentTarget?.scrollTop
      if (top === 0) {
        return
      }

      const offset = top - beginOffset
      const index = getIndexFromVerticalOffset(offset, startWeekOnMonday)

      // Check if the new index is within allowed range
      if (!isIndexWithinRange(index, startYear, endYear)) {
        return
      }

      if (idx.current !== index) {
        idx.current = index
        setVisibleIndexesThrottled(visibleArray(index))
      }
    },
    [setVisibleIndexesThrottled, startWeekOnMonday, startYear, endYear]
  )

  return (
    <div
      ref={parentRef}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        height,
        width,
        overflow: 'auto',
      }}
      onScroll={onScroll}
    >
      <div
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          height: estimatedHeight * totalMonths,
          position: 'relative',
        }}
      >
        {[0, 1, 2, 3, 4].map((vi) => (
          <div
            key={vi}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              willChange: 'transform',
              transform: `translateY(${getVerticalMonthsOffset(
                visibleIndexes[vi],
                startWeekOnMonday
              )}px)`,
              left: 0,
              right: 0,
              position: 'absolute',
              height: getMonthHeight(
                'vertical',
                visibleIndexes[vi],
                startWeekOnMonday
              ),
            }}
          >
            {renderItem({
              index: visibleIndexes[vi],
              onPrev: empty,
              onNext: empty,
            })}
          </div>
        ))}
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
