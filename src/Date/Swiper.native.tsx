import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  View,
} from 'react-native'

import { sharedStyles } from '../shared/styles'
import AutoSizer from './AutoSizer'
import {
  getMonthHeight,
  getVerticalListMetrics,
  getVerticalMonthScrollY,
  getVerticalMonthsOffset,
  horizontalContentHeight,
  indexFromVerticalScroll,
} from './monthLayout'
import {
  assignMonthSlots,
  getMaxIndex,
  getMinIndex,
  getVerticalWindow,
  isIndexWithinRange,
  type MonthSlot,
  nextVisibleIndexes,
  SwiperProps,
  useCalendarKeyboard,
  useFocusDate,
  useYearChange,
} from './SwiperUtils'

const HORIZONTAL_PAGES = 3

function Swiper(props: SwiperProps) {
  return (
    <AutoSizer
      fill={props.scrollMode !== 'horizontal'}
      initialLayout={props.initialLayout}
    >
      {({ height, width }) => (
        <SwiperInner {...props} height={height} width={width} />
      )}
    </AutoSizer>
  )
}

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

/* eslint-disable react-hooks/refs -- The scroll index lives in a ref so handlers stay current. Passing those handlers to render props makes the compiler skip this component, so its manual memoization stays. */
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
  const [monthWindow, setMonthWindow] = useState<{
    activeIndex: number
    indexes: number[]
    slots: MonthSlot[]
  }>(() => {
    const indexes = getVisibleArray(startIndex, {
      endYear,
      isHorizontal,
      startYear,
    })
    return {
      activeIndex: startIndex,
      indexes,
      slots: isHorizontal ? [] : assignMonthSlots([], indexes),
    }
  })
  const visibleIndexes = monthWindow.indexes
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
      setMonthWindow((current) => {
        const indexes = getVisibleArray(index, {
          endYear,
          isHorizontal,
          startYear,
        })
        return {
          activeIndex: index,
          indexes,
          slots: isHorizontal ? [] : assignMonthSlots(current.slots, indexes),
        }
      })
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

  const renderProps = {
    index: 0,
    onNext,
    onPrev,
  }

  const syncVerticalIndex = useCallback(
    (scrollY: number) => {
      const newIndex = indexFromVerticalScroll(
        scrollY,
        verticalMetrics.origin,
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
      setMonthWindow((current) => {
        const indexes = nextVisibleIndexes(
          current.indexes,
          newIndex,
          startYear,
          endYear
        )
        if (indexes === current.indexes) return current
        return {
          activeIndex: newIndex,
          indexes,
          slots: assignMonthSlots(current.slots, indexes),
        }
      })
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
      setMonthWindow({
        activeIndex: newIndex,
        indexes: getVisibleArray(newIndex, {
          endYear,
          isHorizontal,
          startYear,
        }),
        slots: [],
      })
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
      scrollTo(newIndex, false)
    },
    {
      currentIndexRef: idx,
      endYear,
      focusDate,
      startYear,
    }
  )
  useCalendarKeyboard(keyboardEnabled, idx, {
    endYear,
    onConfirm: onKeyboardConfirm,
    onFocusDate,
    onMoveFocus,
    onMoveMonth: moveMonth,
    onOpenMonthMenu,
    onOpenYearMenu,
    startYear,
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

  const pageHeight = isHorizontal
    ? horizontalContentHeight(
        visibleIndexes[1] ?? initialIndex,
        startWeekOnMonday,
        startYear,
        endYear
      )
    : height
  const contentHeight = isHorizontal ? pageHeight : verticalMetrics.height
  const contentWidth = isHorizontal ? width * HORIZONTAL_PAGES : width

  return (
    <>
      <ScrollView
        ref={parentRef}
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
        scrollEventThrottle={16}
        scrollsToTop={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={
          isHorizontal
            ? [styles.horizontalPager, { height: pageHeight }]
            : [sharedStyles.root, sharedStyles.minHeightZero]
        }
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
          {(isHorizontal
            ? visibleIndexes.map((monthIndex, vi) => ({
                monthIndex,
                slot: vi,
              }))
            : monthWindow.slots
          ).map(({ monthIndex, slot }) => {
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
            const monthOffset =
              getVerticalMonthsOffset(
                monthIndex,
                startWeekOnMonday,
                startYear,
                endYear
              ) - verticalMetrics.origin
            return (
              <View
                key={slot}
                style={[
                  styles.month,
                  isHorizontal ? styles.monthHorizontal : styles.monthVertical,
                  isHorizontal
                    ? {
                        height: pageHeight,
                        left: slot * width,
                        width,
                      }
                    : {
                        height: monthHeight,
                        top: monthOffset,
                      },
                ]}
              >
                {inRange
                  ? renderItem({
                      active:
                        !isHorizontal || monthIndex === monthWindow.activeIndex,
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
      {renderHeader && renderHeader(renderProps)}
      {renderFooter && renderFooter(renderProps)}
    </>
  )
}

/* eslint-enable react-hooks/refs */

const styles = StyleSheet.create({
  horizontalPager: {
    flexGrow: 0,
  },
  inner: {
    position: 'relative',
  },
  month: {
    overflow: 'hidden',
    position: 'absolute',
  },
  monthHorizontal: {
    top: 0,
  },
  monthVertical: {
    left: 0,
    right: 0,
  },
})

export default memo(Swiper)
