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

  const setVisibleIndexesThrottled = useDebouncedCallback(setVisibleIndexes, 10)

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

type WidthAndHeight = {
  width: number
  height: number
}

function AutoSizer({
  children,
}: {
  children: ({ width, height }: WidthAndHeight) => any
}) {
  const [layout, setLayout] = React.useState<WidthAndHeight | null>(null)
  const onLayout = React.useCallback(
    (event: any) => {
      const nl = event.nativeEvent.layout

      // https://github.com/necolas/react-native-web/issues/1704
      if (!layout || layout.width !== nl.width || layout.height !== nl.height) {
        setLayout({ width: nl.width, height: nl.height })
      }
    },
    [layout, setLayout]
  )
  return (
    <View style={styles.autoSizer} onLayout={onLayout}>
      {layout ? children(layout) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  autoSizer: {
    flex: 1,
  },
})

export function useDebouncedCallback(callback: any, ms: number): any {
  const mounted = React.useRef<boolean>(true)
  const latest = useLatest(callback)
  const timerId = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [mounted])

  return React.useCallback(
    (args: any) => {
      if (timerId.current) {
        clearTimeout(timerId.current)
      }
      timerId.current = setTimeout(() => {
        if (mounted.current) {
          latest.current(args)
        }
      }, ms)
    },
    [ms, mounted, timerId, latest]
  )
}

const useIsomorphicLayoutEffect =
  // @ts-ignore
  window !== 'undefined' ? React.useLayoutEffect : React.useEffect

export default React.memo(Swiper)
