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
  getMonthHeight,
  getVerticalListMetrics,
  getVerticalMonthScrollY,
  getVerticalMonthsOffset,
  horizontalMonthScrolls,
} from './Month'

import {
  getMaxIndex,
  getMinIndex,
  getVerticalWindow,
  isIndexWithinRange,
  nextVisibleIndexes,
  SwiperProps,
  useFocusDate,
  useYearChange,
} from './SwiperUtils'
import { addMonths, getBeginOffset, getRealIndex } from './dateUtils'
import { useDatePickerKeys } from './datePickerKeys'
import AutoSizer from './AutoSizer'
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { sharedStyles } from '../shared/styles'
import { verticalScrollbarGutter } from './CalendarHeader'

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
    isHorizontal,
    startYear,
  }: {
    endYear?: number
    isHorizontal: boolean
    startYear?: number
  }
) {
  if (isHorizontal) {
    return [i - 1, i, i + 1]
  }
  return getVerticalWindow(i, startYear, endYear)
}

const HORIZONTAL_PAGES = 3

const styles = StyleSheet.create({
  inner: {
    position: 'relative',
  },
})

function Swiper(props: SwiperProps) {
  return (
    <AutoSizer initialLayout={props.initialLayout}>
      {({ height, width }) => (
        <SwiperInner {...props} height={height} width={width} />
      )}
    </AutoSizer>
  )
}

function SwiperInner({
  endYear,
  focusDate,
  height,
  initialIndex,
  keyboardEnabled = true,
  onFocusDate,
  onKeyboardConfirm,
  onMoveFocus,
  onOpenMonthMenu,
  onOpenYearMenu,
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
  const parentRef = useRef<ScrollViewInstance | null>(null)
  const pendingRecenter = useRef(false)
  const pendingScroll = useRef<{ animated: boolean; y: number } | null>(null)
  const restX = width
  const startIndex = clampIndex(initialIndex, startYear, endYear)
  const idx = useRef<number>(startIndex)
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>(
    getVisibleArray(startIndex, { endYear, isHorizontal, startYear })
  )
  const verticalMetrics = useMemo(
    () =>
      getVerticalListMetrics(
        getMinIndex(startYear, endYear),
        getMaxIndex(startYear, endYear),
        startWeekOnMonday,
        startYear,
        endYear
      ),
    [endYear, startWeekOnMonday, startYear]
  )
  const [initialContentOffset] = useState(() => {
    if (isHorizontal) {
      return { x: restX, y: 0 }
    }
    return {
      x: 0,
      y: getVerticalMonthScrollY(
        startIndex,
        verticalMetrics.origin,
        startWeekOnMonday,
        startYear,
        endYear
      ),
    }
  })
  const scrollTo = useCallback(
    (index: number, animated: boolean) => {
      if (!isIndexWithinRange(index, startYear, endYear)) {
        return
      }

      idx.current = index
      if (isHorizontal) {
        pendingRecenter.current = true
      } else {
        pendingScroll.current = {
          animated,
          y: getVerticalMonthScrollY(
            index,
            verticalMetrics.origin,
            startWeekOnMonday,
            startYear,
            endYear
          ),
        }
      }
      setVisibleIndexes(
        getVisibleArray(index, { endYear, isHorizontal, startYear })
      )
    },
    [
      endYear,
      isHorizontal,
      startWeekOnMonday,
      startYear,
      verticalMetrics.origin,
    ]
  )
  const onNext = useCallback(() => {
    const newIndex = idx.current + 1
    if (isIndexWithinRange(newIndex, startYear, endYear)) {
      if (isHorizontal) {
        parentRef.current?.scrollTo({ animated: true, x: restX * 2, y: 0 })
        return
      }
      scrollTo(newIndex, true)
    }
  }, [endYear, isHorizontal, restX, scrollTo, startYear])
  const onPrev = useCallback(() => {
    const newIndex = idx.current - 1
    if (isIndexWithinRange(newIndex, startYear, endYear)) {
      if (isHorizontal) {
        parentRef.current?.scrollTo({ animated: true, x: 0, y: 0 })
        return
      }
      scrollTo(newIndex, true)
    }
  }, [endYear, isHorizontal, scrollTo, startYear])
  const scrollToCurrent = useCallback(() => {
    scrollTo(idx.current, false)
  }, [scrollTo])

  useEffect(scrollToCurrent, [scrollToCurrent])

  useLayoutEffect(() => {
    const pending = pendingScroll.current
    if (pending) {
      pendingScroll.current = null
      parentRef.current?.scrollTo({
        animated: pending.animated,
        x: 0,
        y: pending.y,
      })
    }
    if (pendingRecenter.current) {
      pendingRecenter.current = false
      parentRef.current?.scrollTo({ animated: false, x: restX, y: 0 })
    }
  }, [restX, visibleIndexes])

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

  const renderProps = {
    index: 0,
    onNext,
    onPrev,
  }

  const syncVerticalIndex = useCallback(
    (scrollY: number) => {
      const newIndex = getIndexFromVerticalOffset(
        verticalMetrics.origin + scrollY - getBeginOffset(startYear, endYear),
        startWeekOnMonday,
        startYear,
        endYear
      )
      if (
        newIndex === idx.current ||
        !isIndexWithinRange(newIndex, startYear, endYear)
      ) {
        return
      }
      idx.current = newIndex
      setVisibleIndexes((current) =>
        nextVisibleIndexes(current, newIndex, startYear, endYear)
      )
    },
    [endYear, startWeekOnMonday, startYear, verticalMetrics.origin]
  )

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffset = e.nativeEvent.contentOffset
      if (!isHorizontal) {
        syncVerticalIndex(contentOffset.y)
        return
      }
      const page = Math.round(contentOffset.x / width)
      const delta = page - 1
      if (!delta) {
        return
      }
      const newIndex = idx.current + delta
      if (!isIndexWithinRange(newIndex, startYear, endYear)) {
        parentRef.current?.scrollTo({ animated: true, x: restX, y: 0 })
        return
      }
      idx.current = newIndex
      pendingRecenter.current = true
      setVisibleIndexes(
        getVisibleArray(newIndex, {
          endYear,
          isHorizontal,
          startYear,
        })
      )
    },
    [endYear, isHorizontal, restX, startYear, syncVerticalIndex, width]
  )

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isHorizontal) {
        return
      }
      syncVerticalIndex(e.nativeEvent.contentOffset.y)
    },
    [isHorizontal, syncVerticalIndex]
  )

  const moveMonth = useCallback(
    (delta: number) => {
      scrollTo(idx.current + delta, false)
    },
    [scrollTo]
  )

  useFocusDate(
    (newIndex) => {
      if (
        newIndex !== undefined &&
        isIndexWithinRange(newIndex, startYear, endYear)
      ) {
        scrollTo(newIndex, false)
      }
    },
    {
      currentIndexRef: idx,
      endYear,
      focusDate,
      startYear,
    }
  )

  useDatePickerKeys(keyboardEnabled, {
    getVisibleMonth: () =>
      addMonths(new Date(), getRealIndex(idx.current, startYear, endYear)),
    onConfirm: onKeyboardConfirm,
    onFocusDate,
    onMoveFocus,
    onMoveMonth: moveMonth,
    onOpenMonthMenu,
    onOpenYearMenu,
  })

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

  const contentHeight = isHorizontal ? height : verticalMetrics.height
  const contentWidth = isHorizontal ? width * HORIZONTAL_PAGES : width

  return (
    <>
      <ScrollView
        contentOffset={initialContentOffset}
        decelerationRate={isHorizontal ? 'fast' : 'normal'}
        directionalLockEnabled={isHorizontal}
        horizontal={isHorizontal}
        nestedScrollEnabled={isHorizontal}
        onLayout={isHorizontal ? scrollToCurrent : undefined}
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
                key={isHorizontal ? vi : monthIndex}
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  height: isHorizontal ? height : monthHeight,
                  left: isHorizontal ? vi * width : 0,
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
                      ) - verticalMetrics.origin,
                  width: isHorizontal ? width : undefined,
                }}
              >
                {inRange
                  ? renderItem({
                      active: !isHorizontal || monthIndex === idx.current,
                      index: monthIndex,
                      onNext: onNext,
                      onPrev: onPrev,
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

export default memo(Swiper)
