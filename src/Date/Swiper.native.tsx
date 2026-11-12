import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import type { ScrollViewInstance } from 'react-native'
import {
  getHorizontalMonthOffset,
  getIndexFromVerticalOffset,
  getMonthHeight,
  getVerticalMonthsOffset,
  montHeaderHeight,
} from './Month'

import { SwiperProps, useYearChange, isIndexWithinRange } from './SwiperUtils'
import {
  estimatedMonthHeight,
  getTotalMonths,
  getBeginOffset,
} from './dateUtils'
import AutoSizer from './AutoSizer'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { sharedStyles } from '../shared/styles'
import { verticalScrollbarGutter } from './CalendarHeader'

function getVisibleArray(
  i: number,
  { isHorizontal, height }: { isHorizontal: boolean; height: number }
) {
  if (isHorizontal || height < 700) {
    return [i - 1, i, i + 1]
  }
  return [i - 2, i - 1, i, i + 1, i + 2]
}

function Swiper(props: SwiperProps) {
  return (
    <AutoSizer initialLayout={props.initialLayout}>
      {({ width, height }) => (
        <SwiperInner {...props} height={height} width={width} />
      )}
    </AutoSizer>
  )
}

function SwiperInner({
  endYear,
  height,
  initialIndex,
  renderFooter,
  renderHeader,
  renderItem,
  scrollMode,
  selectedYear,
  startWeekOnMonday,
  startYear,
  width,
}: SwiperProps & { height: number; width: number }) {
  const idx = useRef<number>(initialIndex)
  const isHorizontal = scrollMode === 'horizontal'
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>(
    getVisibleArray(initialIndex, { isHorizontal, height })
  )

  const parentRef = useRef<ScrollViewInstance | null>(null)

  // Start on the current month instead of at 0 (where no month is rendered)
  // and then jumping there after mount. Later moves go through scrollTo.
  const [initialContentOffset] = useState(() => {
    if (!isIndexWithinRange(initialIndex, startYear, endYear)) {
      return undefined
    }
    return isHorizontal
      ? { x: getHorizontalMonthOffset(initialIndex, width), y: 0 }
      : {
          x: 0,
          y:
            getVerticalMonthsOffset(
              initialIndex,
              startWeekOnMonday,
              startYear,
              endYear
            ) - montHeaderHeight,
        }
  })

  const scrollTo = useCallback(
    (index: number, animated: boolean) => {
      if (!isIndexWithinRange(index, startYear, endYear)) {
        return
      }

      idx.current = index
      setVisibleIndexes(getVisibleArray(index, { isHorizontal, height }))

      const offset = isHorizontal
        ? getHorizontalMonthOffset(index, width)
        : getVerticalMonthsOffset(
            index,
            startWeekOnMonday,
            startYear,
            endYear
          ) - montHeaderHeight

      const scroller = parentRef.current!
      if (isHorizontal) {
        scroller.scrollTo({
          y: 0,
          x: offset,
          animated,
        })
      } else {
        scroller.scrollTo({
          y: offset,
          x: 0,
          animated,
        })
      }
    },
    [
      parentRef,
      isHorizontal,
      width,
      height,
      startWeekOnMonday,
      startYear,
      endYear,
    ]
  )

  const onPrev = useCallback(() => {
    const newIndex = idx.current - 1
    if (isIndexWithinRange(newIndex, startYear, endYear)) {
      scrollTo(newIndex, true)
    }
  }, [scrollTo, idx, startYear, endYear])

  const onNext = useCallback(() => {
    const newIndex = idx.current + 1
    if (isIndexWithinRange(newIndex, startYear, endYear)) {
      scrollTo(newIndex, true)
    }
  }, [scrollTo, idx, startYear, endYear])

  const scrollToCurrent = useCallback(() => {
    scrollTo(idx.current, false)
  }, [scrollTo])

  // onLayout can run against the previous page width during rotation, before
  useEffect(scrollToCurrent, [scrollToCurrent])

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffset = e.nativeEvent.contentOffset
      const viewSize = e.nativeEvent.layoutMeasurement
      const dynamicBeginOffset = getBeginOffset(startYear, endYear)
      const newIndex = isHorizontal
        ? Math.round(contentOffset.x / viewSize.width)
        : getIndexFromVerticalOffset(
            contentOffset.y - dynamicBeginOffset,
            startWeekOnMonday,
            startYear,
            endYear
          )

      if (newIndex === 0) {
        return
      }

      if (!isIndexWithinRange(newIndex, startYear, endYear)) {
        return
      }

      if (idx.current !== newIndex) {
        idx.current = newIndex
        setVisibleIndexes(getVisibleArray(newIndex, { isHorizontal, height }))
      }
    },
    [idx, height, isHorizontal, startWeekOnMonday, startYear, endYear]
  )

  const renderProps = {
    index: 0,
    onPrev,
    onNext,
  }

  const needsMonthScroll =
    isHorizontal &&
    visibleIndexes.some(
      (monthIndex) =>
        getMonthHeight(
          scrollMode,
          monthIndex,
          startWeekOnMonday,
          startYear,
          endYear
        ) > height
    )

  useYearChange(
    (newIndex) => {
      if (newIndex && isIndexWithinRange(newIndex, startYear, endYear)) {
        scrollTo(newIndex, false)
      }
    },
    {
      currentIndexRef: idx,
      endYear,
      selectedYear,
      startYear,
    }
  )

  return (
    <>
      <ScrollView
        contentOffset={initialContentOffset}
        decelerationRate="fast"
        directionalLockEnabled={isHorizontal}
        horizontal={isHorizontal}
        nestedScrollEnabled={isHorizontal}
        onLayout={scrollToCurrent}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onMomentumScrollEnd}
        pagingEnabled={isHorizontal}
        ref={parentRef}
        scrollEventThrottle={10}
        scrollsToTop={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={[sharedStyles.root, sharedStyles.minHeightZero]}
      >
        <View
          style={[
            styles.inner,
            {
              height: isHorizontal
                ? height
                : estimatedMonthHeight * getTotalMonths(startYear, endYear),
              width: isHorizontal
                ? width * getTotalMonths(startYear, endYear)
                : width,
            },
          ]}
        >
          {new Array(visibleIndexes.length).fill(undefined).map((_, vi) => {
            const monthIndex = visibleIndexes[vi]
            const monthHeight = getMonthHeight(
              scrollMode,
              monthIndex,
              startWeekOnMonday,
              startYear,
              endYear
            )
            // Horizontal paging does not scroll inside a month. Bound the
            // page to the dialog so the day grid can scroll in landscape.
            return (
              <View
                key={vi}
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  height: isHorizontal ? height : monthHeight,
                  left: isHorizontal
                    ? getHorizontalMonthOffset(monthIndex, width)
                    : 0,
                  overflow: 'hidden',
                  position: 'absolute',
                  right: isHorizontal ? undefined : 0,
                  top: isHorizontal
                    ? 0
                    : getVerticalMonthsOffset(
                        monthIndex,
                        startWeekOnMonday,
                        startYear,
                        endYear
                      ),
                  width: isHorizontal ? width : undefined,
                }}
              >
                {renderItem({
                  index: monthIndex,
                  onPrev: onPrev,
                  onNext: onNext,
                })}
              </View>
            )
          })}
        </View>
      </ScrollView>
      {renderHeader &&
        renderHeader({
          ...renderProps,
          endInset: needsMonthScroll ? verticalScrollbarGutter : 0,
        })}
      {renderFooter && renderFooter(renderProps)}
    </>
  )
}

const styles = StyleSheet.create({
  inner: {
    position: 'relative',
  },
})

export default memo(Swiper)
