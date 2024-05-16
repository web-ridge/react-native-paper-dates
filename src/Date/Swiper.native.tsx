import * as React from 'react'
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

import { SwiperProps, useYearChange } from './SwiperUtils'
import { beginOffset, estimatedMonthHeight, totalMonths } from './dateUtils'
import AutoSizer from './AutoSizer'

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  inner: {
    position: 'relative',
  },
})

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
}: SwiperProps & { width: number; height: number }) {
  const idx = React.useRef<number>(initialIndex)
  const isHorizontal = scrollMode === 'horizontal'
  const [visibleIndexes, setVisibleIndexes] = React.useState<number[]>(
    getVisibleArray(initialIndex, { isHorizontal, height })
  )

  const parentRef = React.useRef<ScrollView | null>(null)

  const scrollTo = React.useCallback(
    (index: number, animated: boolean) => {
      idx.current = index
      setVisibleIndexes(getVisibleArray(index, { isHorizontal, height }))

      if (!parentRef.current) {
        return
      }
      const offset = isHorizontal
        ? getHorizontalMonthOffset(index, width)
        : getVerticalMonthsOffset(index, startWeekOnMonday) - montHeaderHeight

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
    [parentRef, isHorizontal, width, height, startWeekOnMonday]
  )

  const onPrev = React.useCallback(() => {
    scrollTo(idx.current - 1, true)
  }, [scrollTo, idx])

  const onNext = React.useCallback(() => {
    scrollTo(idx.current + 1, true)
  }, [scrollTo, idx])

  const scrollToInitial = React.useCallback(() => {
    scrollTo(idx.current, false)
  }, [scrollTo])

  const onMomentumScrollEnd = React.useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffset = e.nativeEvent.contentOffset
      const viewSize = e.nativeEvent.layoutMeasurement
      const newIndex = isHorizontal
        ? Math.floor(contentOffset.x / viewSize.width)
        : getIndexFromVerticalOffset(
            contentOffset.y - beginOffset,
            startWeekOnMonday
          )

      if (newIndex === 0) {
        return
      }

      if (idx.current !== newIndex) {
        idx.current = newIndex
        setVisibleIndexes(getVisibleArray(newIndex, { isHorizontal, height }))
      }
    },
    [idx, height, isHorizontal, startWeekOnMonday]
  )

  const renderProps = {
    index: 0,
    onPrev,
    onNext,
  }

  useYearChange(
    (newIndex) => {
      if (newIndex) {
        scrollTo(newIndex, false)
      }
    },
    {
      selectedYear,
      currentIndexRef: idx,
    }
  )

  return (
    <>
      <ScrollView
        scrollsToTop={false}
        ref={parentRef}
        horizontal={isHorizontal}
        pagingEnabled={isHorizontal}
        style={styles.viewPager}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onMomentumScrollEnd}
        onLayout={scrollToInitial}
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
                : estimatedMonthHeight * totalMonths,
              width: isHorizontal ? width * totalMonths : width,
            },
          ]}
        >
          {visibleIndexes
            ? new Array(visibleIndexes.length).fill(undefined).map((_, vi) => (
                <View
                  key={vi}
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{
                    top: isHorizontal
                      ? 0
                      : getVerticalMonthsOffset(
                          visibleIndexes[vi],
                          startWeekOnMonday
                        ),
                    left: isHorizontal
                      ? getHorizontalMonthOffset(visibleIndexes[vi], width)
                      : 0,
                    right: isHorizontal ? undefined : 0,
                    bottom: isHorizontal ? 0 : undefined,
                    position: 'absolute',
                    width: isHorizontal ? width : undefined,
                    height: isHorizontal
                      ? undefined
                      : getMonthHeight(
                          scrollMode,
                          visibleIndexes[vi],
                          startWeekOnMonday
                        ),
                  }}
                >
                  {renderItem({
                    index: visibleIndexes[vi],
                    onPrev: onPrev,
                    onNext: onNext,
                  })}
                </View>
              ))
            : null}
        </View>
      </ScrollView>
      {renderHeader && renderHeader(renderProps)}
      {renderFooter && renderFooter(renderProps)}
    </>
  )
}

export default React.memo(Swiper)
