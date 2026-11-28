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
  { isHorizontal }: { isHorizontal: boolean; height: number }
) {
  // Vertical months are shorter than the viewport: keep two each side so a
  // fling stays covered between onScroll window moves.
  if (isHorizontal) {
    return [i - 1, i, i + 1]
  }
  return [i - 2, i - 1, i, i + 1, i + 2]
}

function Swiper(props: SwiperProps) {
  return (
    <AutoSizer initialLayout={props.initialLayout}>
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

  const getIndexFromScroll = useCallback(
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

      if (newIndex === 0 || !isIndexWithinRange(newIndex, startYear, endYear)) {
        return undefined
      }
      return newIndex
    },
    [isHorizontal, startWeekOnMonday, startYear, endYear]
  )

  const showAround = useCallback(
    (index: number) => {
      setVisibleIndexes((prev) =>
        prev[(prev.length - 1) / 2] === index
          ? prev
          : getVisibleArray(index, { isHorizontal, height })
      )
    },
    [isHorizontal, height]
  )

  // Move the mounted months while scrolling, not only when the fling ends,
  // otherwise a fast fling on Android outruns them and shows blank space.
  // idx is left alone here so an animated onPrev/onNext keeps its target.
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newIndex = getIndexFromScroll(e)
      if (newIndex !== undefined) {
        showAround(newIndex)
      }
    },
    [getIndexFromScroll, showAround]
  )

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newIndex = getIndexFromScroll(e)
      if (newIndex !== undefined) {
        idx.current = newIndex
        showAround(newIndex)
      }
    },
    [getIndexFromScroll, showAround]
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
        onScroll={onScroll}
        onLayout={scrollToCurrent}
        contentOffset={initialContentOffset}
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
            ? visibleIndexes.map((monthIndex) => {
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
                    // Keyed by month so a window shift mounts only the new month.
                    key={monthIndex}
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
