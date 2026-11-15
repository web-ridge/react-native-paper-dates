import {
  memo,
  type CSSProperties,
  type ReactNode,
  type UIEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useTheme } from 'react-native-paper'

import { themeColor, useLatest } from '../shared/utils'
import AutoSizer from './AutoSizer'
import {
  overlayScrollbarPadding,
  weekdayScrollbarInset,
} from './CalendarHeader'
import { useDatePickerKeys } from './datePickerKeys'
import {
  addMonths,
  defaultEndYear,
  defaultStartYear,
  getBeginOffset,
  getRealIndex,
} from './dateUtils'
import {
  getIndexFromVerticalOffset,
  getMonthHeight,
  getVerticalListMetrics,
  getVerticalMonthScrollY,
  getVerticalMonthsOffset,
} from './Month'
import {
  getMaxIndex,
  getMinIndex,
  getVerticalWindow,
  isIndexWithinRange,
  nextVisibleIndexes,
  type RenderProps,
  type SwiperProps,
  useFocusDate,
  useYearChange,
} from './SwiperUtils'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

function Swiper({
  endYear,
  focusDate,
  initialIndex,
  initialLayout,
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
}: SwiperProps) {
  const [index, setIndex] = useState(initialIndex)
  const indexRef = useLatest(index)

  const isHorizontal = scrollMode === 'horizontal'

  const shiftIndex = useCallback(
    (delta: number) => {
      setIndex((prev) => {
        const newIndex = prev + delta
        return isIndexWithinRange(newIndex, startYear, endYear)
          ? newIndex
          : prev
      })
    },
    [endYear, startYear]
  )
  const onNext = useCallback(() => shiftIndex(1), [shiftIndex])
  const onPrev = useCallback(() => shiftIndex(-1), [shiftIndex])

  const renderProps = {
    index,
    onNext,
    onPrev,
  }
  useFocusDate(
    (newIndex) => {
      setIndex(newIndex)
    },
    {
      currentIndexRef: indexRef,
      endYear,
      focusDate,
      startYear,
    }
  )
  useDatePickerKeys(keyboardEnabled, {
    getVisibleMonth: () =>
      addMonths(new Date(), getRealIndex(indexRef.current, startYear, endYear)),
    onConfirm: onKeyboardConfirm,
    onFocusDate,
    onMoveFocus,
    onMoveMonth: shiftIndex,
    onOpenMonthMenu,
    onOpenYearMenu,
  })
  useYearChange(
    (newIndex) => {
      if (newIndex && isIndexWithinRange(newIndex, startYear, endYear)) {
        setIndex(newIndex)
      }
    },
    {
      currentIndexRef: indexRef,
      endYear,
      selectedYear,
      startYear,
    }
  )

  return (
    <>
      {isHorizontal ? (
        <AutoSizer initialLayout={initialLayout}>
          {() => (
            <>
              {renderItem({
                active: true,
                index,
                onNext,
                onPrev,
              })}
              {renderHeader ? renderHeader(renderProps) : null}
            </>
          )}
        </AutoSizer>
      ) : (
        <>
          {renderHeader &&
            renderHeader({
              ...renderProps,
              endInset: weekdayScrollbarInset(),
            })}
          <AutoSizer initialLayout={initialLayout}>
            {({ height, width }) => (
              <VerticalScroller
                contentInset={overlayScrollbarPadding()}
                endYear={endYear}
                height={height}
                initialIndex={initialIndex}
                renderItem={renderItem}
                startWeekOnMonday={startWeekOnMonday}
                startYear={startYear}
                width={width}
              />
            )}
          </AutoSizer>
        </>
      )}
      {renderFooter && renderFooter(renderProps)}
    </>
  )
}

const empty = () => null

function VerticalScroller({
  contentInset,
  endYear,
  height,
  initialIndex,
  renderItem,
  startWeekOnMonday,
  startYear,
  width,
}: {
  contentInset: number
  endYear?: number
  height: number
  initialIndex: number
  renderItem: (renderProps: RenderProps) => ReactNode
  startWeekOnMonday: boolean
  startYear?: number
  width: number
}) {
  const effectiveEndYear = endYear || defaultEndYear
  const effectiveStartYear = startYear || defaultStartYear
  const constrainedInitialIndex = isIndexWithinRange(
    initialIndex,
    effectiveStartYear,
    effectiveEndYear
  )
    ? initialIndex
    : Math.max(
        Math.min(initialIndex, getMaxIndex(effectiveEndYear)),
        getMinIndex(effectiveStartYear)
      )
  const idx = useRef<number>(constrainedInitialIndex)
  const parentRef = useRef<HTMLDivElement | null>(null)
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>(() =>
    getVerticalWindow(
      constrainedInitialIndex,
      effectiveStartYear,
      effectiveEndYear
    )
  )
  const theme = useTheme()
  const verticalMetrics = getVerticalListMetrics(
    getMinIndex(effectiveStartYear, effectiveEndYear),
    getMaxIndex(effectiveStartYear, effectiveEndYear),
    startWeekOnMonday,
    effectiveStartYear,
    effectiveEndYear
  )

  useIsomorphicLayoutEffect(() => {
    const element = parentRef.current
    if (!element) {
      return
    }
    element.scrollTo({
      top: getVerticalMonthScrollY(
        idx.current,
        verticalMetrics.origin,
        startWeekOnMonday,
        effectiveStartYear,
        effectiveEndYear
      ),
    })
  }, [])
  const onScroll = useCallback(
    (e: UIEvent) => {
      const top = e.currentTarget?.scrollTop
      if (top === undefined) {
        return
      }

      const index = getIndexFromVerticalOffset(
        verticalMetrics.origin +
          top -
          getBeginOffset(effectiveStartYear, effectiveEndYear),
        startWeekOnMonday,
        effectiveStartYear,
        effectiveEndYear
      )

      if (
        !isIndexWithinRange(index, effectiveStartYear, effectiveEndYear) ||
        idx.current === index
      ) {
        return
      }

      idx.current = index
      setVisibleIndexes((current) =>
        nextVisibleIndexes(current, index, effectiveStartYear, effectiveEndYear)
      )
    },
    [
      effectiveEndYear,
      effectiveStartYear,
      startWeekOnMonday,
      verticalMetrics.origin,
    ]
  )

  const scrollerStyle: CSSProperties = {
    boxSizing: 'border-box',
    colorScheme: theme.dark ? 'dark' : 'light',
    height,
    overflow: 'auto',
    paddingRight: contentInset,
    overflowAnchor: 'none',
    scrollbarColor: `${themeColor(theme.colors.outline)} ${themeColor(
      theme.colors.elevation.level3
    )}`,
    width,
  }
  const trackStyle: CSSProperties = {
    height: verticalMetrics.height,
    position: 'relative',
  }

  return (
    <div onScroll={onScroll} ref={parentRef} style={scrollerStyle}>
      <div style={trackStyle}>
        {visibleIndexes.map((monthIndex) => {
          const monthStyle: CSSProperties = {
            height: getMonthHeight(
              'vertical',
              monthIndex,
              startWeekOnMonday,
              effectiveStartYear,
              effectiveEndYear
            ),
            left: 0,
            position: 'absolute',
            right: 0,
            transform: `translateY(${
              getVerticalMonthsOffset(
                monthIndex,
                startWeekOnMonday,
                effectiveStartYear,
                effectiveEndYear
              ) - verticalMetrics.origin
            }px)`,
            willChange: 'transform',
          }
          return (
            <div key={monthIndex} style={monthStyle}>
              {renderItem({
                index: monthIndex,
                onNext: empty,
                onPrev: empty,
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(Swiper)
