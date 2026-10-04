import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
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
    <AutoSizer>
      {({ width, height }) => (
        <SwiperInner {...props} width={width} height={height} />
      )}
    </AutoSizer>
  )
}

function SwiperInner({
  scrollMode,
  renderItem,
  renderHeader,
  renderFooter,
  selectedYear,
  initialIndex,
  width,
  height,
  startWeekOnMonday,
  startYear,
  endYear,
}: SwiperProps & { width: number; height: number }) {
  const idx = useRef<number>(initialIndex)
  const isHorizontal = scrollMode === 'horizontal'
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>(
    getVisibleArray(initialIndex, { isHorizontal, height })
  )

  const parentRef = useRef<ScrollView | null>(null)

  const scrollTo = useCallback(
    (index: number, animated: boolean) => {
      if (!isIndexWithinRange(index, startYear, endYear)) {
        return
      }

      idx.current = index
      setVisibleIndexes(getVisibleArray(index, { isHorizontal, height }))

      if (!parentRef.current) {
        return
      }
      const offset = isHorizontal
        ? getHorizontalMonthOffset(index, width)
        : getVerticalMonthsOffset(
            index,
            startWeekOnMonday,
            startYear,
            endYear
          ) - montHeaderHeight

      if (isHorizontal) {
        parentRef.current.scrollTo({
          y: 0,
          x: offset,
          animated,
        })
      } else {
        parentRef.current.scrollTo({
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
      selectedYear,
      currentIndexRef: idx,
      startYear,
      endYear,
    }
  )

  return (
    <>
      <ScrollView
        scrollsToTop={false}
        ref={parentRef}
        horizontal={isHorizontal}
        pagingEnabled={isHorizontal}
        nestedScrollEnabled={isHorizontal}
        directionalLockEnabled={isHorizontal}
        style={[sharedStyles.root, sharedStyles.minHeightZero]}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onMomentumScrollEnd}
        onLayout={scrollToCurrent}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        scrollEventThrottle={10}
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
          {visibleIndexes
            ? new Array(visibleIndexes.length).fill(undefined).map((_, vi) => {
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
                      top: isHorizontal
                        ? 0
                        : getVerticalMonthsOffset(
                            monthIndex,
                            startWeekOnMonday,
                            startYear,
                            endYear
                          ),
                      left: isHorizontal
                        ? getHorizontalMonthOffset(monthIndex, width)
                        : 0,
                      right: isHorizontal ? undefined : 0,
                      position: 'absolute',
                      width: isHorizontal ? width : undefined,
                      height: isHorizontal ? height : monthHeight,
                      overflow: 'hidden',
                    }}
                  >
                    {renderItem({
                      index: monthIndex,
                      onPrev: onPrev,
                      onNext: onNext,
                    })}
                  </View>
                )
              })
            : null}
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
