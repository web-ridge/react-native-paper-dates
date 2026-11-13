import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import type { ScrollViewInstance } from 'react-native'
import {
  getIndexFromVerticalOffset,
  getLocalMonthOffset,
  getMonthHeight,
  getVerticalMonthsOffset,
  getVisibleMonthsHeight,
  horizontalMonthScrolls,
  montHeaderHeight,
} from './Month'

import {
  SwiperProps,
  getMaxIndex,
  getMinIndex,
  isIndexWithinRange,
  useYearChange,
} from './SwiperUtils'
import { getBeginOffset } from './dateUtils'
import AutoSizer from './AutoSizer'
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { sharedStyles } from '../shared/styles'
import { verticalScrollbarGutter } from './CalendarHeader'

const HORIZONTAL_PAGES = 3

function clampIndex(i: number, startYear?: number, endYear?: number) {
  if (isIndexWithinRange(i, startYear, endYear)) {
    return i
  }
  return Math.max(
    getMinIndex(startYear, endYear),
    Math.min(getMaxIndex(startYear, endYear), i)
  )
}

function getVisibleArray(
  i: number,
  {
    endYear,
    height,
    isHorizontal,
    startYear,
  }: {
    endYear?: number
    height: number
    isHorizontal: boolean
    startYear?: number
  }
) {
  if (isHorizontal) {
    return [i - 1, i, i + 1]
  }
  const span = height < 700 ? 1 : 2
  const indexes: number[] = []
  for (let offset = -span; offset <= span; offset += 1) {
    const index = i + offset
    if (isIndexWithinRange(index, startYear, endYear)) {
      indexes.push(index)
    }
  }
  return indexes.length ? indexes : [i]
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
  const isHorizontal = scrollMode === 'horizontal'
  const startIndex = clampIndex(initialIndex, startYear, endYear)
  const idx = useRef<number>(startIndex)
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>(
    getVisibleArray(startIndex, { endYear, height, isHorizontal, startYear })
  )

  const ignoreScroll = useRef(false)
  const parentRef = useRef<ScrollViewInstance | null>(null)
  const pendingRecenter = useRef(false)
  const pendingWindowY = useRef<number | null>(null)

  const restX = width
  const [initialContentOffset] = useState(() => {
    if (isHorizontal) {
      return { x: restX, y: 0 }
    }
    const indexes = getVisibleArray(startIndex, {
      endYear,
      height,
      isHorizontal,
      startYear,
    })
    return {
      x: 0,
      y:
        getLocalMonthOffset(
          indexes,
          startIndex,
          startWeekOnMonday,
          startYear,
          endYear
        ) - montHeaderHeight,
    }
  })

  const scrollToRest = useCallback(
    (index: number) => {
      const scroller = parentRef.current
      if (!scroller) {
        return
      }
      if (isHorizontal) {
        scroller.scrollTo({ x: restX, y: 0, animated: false })
        return
      }
      scroller.scrollTo({
        x: 0,
        y:
          getLocalMonthOffset(
            visibleIndexes,
            index,
            startWeekOnMonday,
            startYear,
            endYear
          ) - montHeaderHeight,
        animated: false,
      })
    },
    [endYear, isHorizontal, restX, startWeekOnMonday, startYear, visibleIndexes]
  )

  const scrollTo = useCallback(
    (index: number, _animated: boolean) => {
      if (!isIndexWithinRange(index, startYear, endYear)) {
        return
      }

      idx.current = index
      pendingRecenter.current = true
      setVisibleIndexes(
        getVisibleArray(index, { endYear, height, isHorizontal, startYear })
      )
    },
    [endYear, height, isHorizontal, startYear]
  )

  const onPrev = useCallback(() => {
    const newIndex = idx.current - 1
    if (isIndexWithinRange(newIndex, startYear, endYear)) {
      if (isHorizontal) {
        parentRef.current?.scrollTo({ x: 0, y: 0, animated: true })
        return
      }
      scrollTo(newIndex, true)
    }
  }, [endYear, isHorizontal, scrollTo, startYear])

  const onNext = useCallback(() => {
    const newIndex = idx.current + 1
    if (isIndexWithinRange(newIndex, startYear, endYear)) {
      if (isHorizontal) {
        parentRef.current?.scrollTo({ x: restX * 2, y: 0, animated: true })
        return
      }
      scrollTo(newIndex, true)
    }
  }, [endYear, isHorizontal, restX, scrollTo, startYear])

  const scrollToCurrent = useCallback(() => {
    scrollTo(idx.current, false)
  }, [scrollTo])

  useEffect(scrollToCurrent, [scrollToCurrent])

  useLayoutEffect(() => {
    if (pendingWindowY.current !== null) {
      const y = pendingWindowY.current
      pendingWindowY.current = null
      parentRef.current?.scrollTo({ x: 0, y, animated: false })
      requestAnimationFrame(() => {
        ignoreScroll.current = false
      })
      return
    }
    if (pendingRecenter.current) {
      pendingRecenter.current = false
      scrollToRest(idx.current)
    }
  }, [scrollToRest, visibleIndexes])

  const applyVerticalIndex = useCallback(
    (newIndex: number, localY: number) => {
      if (newIndex === idx.current) {
        return
      }
      if (!isIndexWithinRange(newIndex, startYear, endYear)) {
        return
      }
      const absY =
        getVerticalMonthsOffset(
          visibleIndexes[0],
          startWeekOnMonday,
          startYear,
          endYear
        ) + localY
      const nextVisible = getVisibleArray(newIndex, {
        endYear,
        height,
        isHorizontal: false,
        startYear,
      })
      idx.current = newIndex
      ignoreScroll.current = true
      pendingWindowY.current =
        absY -
        getVerticalMonthsOffset(
          nextVisible[0],
          startWeekOnMonday,
          startYear,
          endYear
        )
      setVisibleIndexes(nextVisible)
    },
    [endYear, height, startWeekOnMonday, startYear, visibleIndexes]
  )

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isHorizontal || ignoreScroll.current) {
        return
      }
      const localY = e.nativeEvent.contentOffset.y
      const absY =
        getVerticalMonthsOffset(
          visibleIndexes[0],
          startWeekOnMonday,
          startYear,
          endYear
        ) + localY
      const newIndex = getIndexFromVerticalOffset(
        absY - getBeginOffset(startYear, endYear),
        startWeekOnMonday,
        startYear,
        endYear
      )
      applyVerticalIndex(newIndex, localY)
    },
    [
      applyVerticalIndex,
      endYear,
      isHorizontal,
      startWeekOnMonday,
      startYear,
      visibleIndexes,
    ]
  )

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffset = e.nativeEvent.contentOffset
      if (isHorizontal) {
        const page = Math.round(contentOffset.x / width)
        const delta = page - 1
        if (!delta) {
          return
        }
        const newIndex = idx.current + delta
        if (!isIndexWithinRange(newIndex, startYear, endYear)) {
          parentRef.current?.scrollTo({ x: restX, y: 0, animated: true })
          return
        }
        idx.current = newIndex
        pendingRecenter.current = true
        setVisibleIndexes(
          getVisibleArray(newIndex, {
            endYear,
            height,
            isHorizontal,
            startYear,
          })
        )
        return
      }

      applyVerticalIndex(
        getIndexFromVerticalOffset(
          getVerticalMonthsOffset(
            visibleIndexes[0],
            startWeekOnMonday,
            startYear,
            endYear
          ) +
            contentOffset.y -
            getBeginOffset(startYear, endYear),
          startWeekOnMonday,
          startYear,
          endYear
        ),
        contentOffset.y
      )
    },
    [
      applyVerticalIndex,
      endYear,
      height,
      isHorizontal,
      restX,
      startWeekOnMonday,
      startYear,
      visibleIndexes,
      width,
    ]
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
        isIndexWithinRange(monthIndex, startYear, endYear) &&
        horizontalMonthScrolls(
          height,
          monthIndex,
          startWeekOnMonday,
          startYear,
          endYear
        )
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

  const contentWidth = isHorizontal ? width * HORIZONTAL_PAGES : width
  const contentHeight = isHorizontal
    ? height
    : getVisibleMonthsHeight(
        visibleIndexes,
        startWeekOnMonday,
        startYear,
        endYear
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
        onScroll={isHorizontal ? undefined : onScroll}
        onScrollEndDrag={onMomentumScrollEnd}
        pagingEnabled={isHorizontal}
        ref={parentRef}
        scrollEventThrottle={16}
        scrollsToTop={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={[sharedStyles.root, sharedStyles.minHeightZero]}
      >
        <View
          style={[
            styles.inner,
            {
              height: contentHeight,
              width: contentWidth,
            },
          ]}
        >
          {visibleIndexes.map((monthIndex, vi) => {
            const inRange = isIndexWithinRange(monthIndex, startYear, endYear)
            const monthHeight = inRange
              ? getMonthHeight(
                  scrollMode,
                  monthIndex,
                  startWeekOnMonday,
                  startYear,
                  endYear
                )
              : height
            return (
              <View
                key={vi}
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  height: isHorizontal ? height : monthHeight,
                  left: isHorizontal ? vi * width : 0,
                  overflow: 'hidden',
                  position: 'absolute',
                  right: isHorizontal ? undefined : 0,
                  top: isHorizontal
                    ? 0
                    : getLocalMonthOffset(
                        visibleIndexes,
                        monthIndex,
                        startWeekOnMonday,
                        startYear,
                        endYear
                      ),
                  width: isHorizontal ? width : undefined,
                }}
              >
                {inRange
                  ? renderItem({
                      index: monthIndex,
                      onPrev: onPrev,
                      onNext: onNext,
                    })
                  : null}
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
