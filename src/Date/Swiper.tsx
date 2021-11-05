import * as React from 'react'
import { StyleSheet, View } from 'react-native'

import {
  getIndexFromVerticalOffset,
  getMonthHeight,
  getVerticalMonthsOffset,
  montHeaderHeight,
} from './Month'

import { beginOffset, estimatedMonthHeight, totalMonths } from './dateUtils'
import { useLatest } from '../utils'
import { RenderProps, SwiperProps, useYearChange } from './SwiperUtils'
import AutoSizer from './AutoSizer'

function Swiper({
  scrollMode,
  renderItem,
  renderHeader,
  renderFooter,
  selectedYear,
  initialIndex,
}: SwiperProps) {
  const isHorizontal = scrollMode === 'horizontal'
  const [index, setIndex] = React.useState(initialIndex)

  const onPrev = React.useCallback(() => {
    setIndex((prev) => prev - 1)
  }, [setIndex])

  const onNext = React.useCallback(() => {
    setIndex((prev) => prev + 1)
  }, [setIndex])

  const renderProps = {
    index,
    onPrev,
    onNext,
  }
  const indexRef = useLatest(index)
  useYearChange(
    (newIndex) => {
      if (newIndex) {
        setIndex(newIndex)
      }
    },
    {
      selectedYear,
      currentIndexRef: indexRef,
    }
  )

  return (
    <>
      {renderHeader && renderHeader(renderProps)}
      {isHorizontal ? (
        <View style={styles.flex1}>
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
}: {
  renderItem: (renderProps: RenderProps) => any
  width: number
  height: number
  initialIndex: number
  estimatedHeight: number
}) {
  const idx = React.useRef<number>(initialIndex)
  const [visibleIndexes, setVisibleIndexes] = React.useState<number[]>(
    visibleArray(initialIndex)
  )
  // eslint-disable-next-line no-undef
  const parentRef = React.useRef<HTMLDivElement | null>(null)

  useIsomorphicLayoutEffect(() => {
    const element = parentRef.current
    if (!element) {
      return
    }
    const top = getVerticalMonthsOffset(idx.current) - montHeaderHeight

    element.scrollTo({
      top,
    })
  }, [parentRef, idx])

  const setVisibleIndexesThrottled = useDebouncedCallback(setVisibleIndexes)

  const onScroll = React.useCallback(
    (e: React.UIEvent) => {
      const top = e.currentTarget.scrollTop
      if (top === 0) {
        return
      }

      const offset = top - beginOffset
      const index = getIndexFromVerticalOffset(offset)

      if (idx.current !== index) {
        idx.current = index
        setVisibleIndexesThrottled(visibleArray(index))
      }
    },
    [setVisibleIndexesThrottled]
  )

  return (
    <div
      ref={parentRef}
      style={{
        height,
        width,
        overflow: 'auto',
      }}
      onScroll={onScroll}
    >
      <div
        style={{
          height: estimatedHeight * totalMonths,
          position: 'relative',
        }}
      >
        {[0, 1, 2, 3, 4].map((vi) => (
          <div
            key={vi}
            style={{
              willChange: 'transform',
              transform: `translateY(${getVerticalMonthsOffset(
                visibleIndexes[vi]
              )}px)`,
              left: 0,
              right: 0,
              position: 'absolute',
              height: getMonthHeight('vertical', visibleIndexes[vi]),
              // transform: `translateY(${getMonthsOffset('vertical', vi)}px)`,
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

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
})

export function useDebouncedCallback(callback: any): any {
  const mounted = React.useRef<boolean>(true)
  const latest = useLatest(callback)
  const timerId = React.useRef<any>(null)

  React.useEffect(() => {
    return () => {
      mounted.current = false
      if (timerId.current) {
        window.cancelAnimationFrame(timerId.current)
      }
    }
  }, [mounted, timerId])

  return React.useCallback(
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

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

export default React.memo(Swiper)
