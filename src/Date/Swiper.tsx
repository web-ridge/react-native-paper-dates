import {
  type CSSProperties,
  memo,
  type ReactNode,
  type UIEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { sharedStyles } from '../shared/styles'
import { themeColor, useLatest } from '../shared/utils'
import AutoSizer from './AutoSizer'
import {
  overlayScrollbarPadding,
  weekdayScrollbarInset,
} from './CalendarHeader'
import { defaultEndYear, defaultStartYear } from './dateUtils'
import {
  getMonthHeight,
  getVerticalListMetrics,
  getVerticalMonthScrollY,
  getVerticalMonthsOffset,
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
  type RenderProps,
  type SwiperProps,
  useCalendarKeyboard,
  useFocusDate,
  useYearChange,
} from './SwiperUtils'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

const empty = () => null

function Swiper({
  endYear,
  focusDate,
  initialIndex,
  initialLayout,
  keyboardEnabled = true,
  onFocusDate,
  onKeyboardConfirm,
  onMoveDay,
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

  const shiftIndex = (delta: number) => {
    setIndex((prev) => {
      const newIndex = prev + delta
      return isIndexWithinRange(newIndex, startYear, endYear) ? newIndex : prev
    })
  }
  const onNext = () => shiftIndex(1)
  const onPrev = () => shiftIndex(-1)

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
  useCalendarKeyboard(keyboardEnabled, indexRef, {
    endYear,
    onConfirm: onKeyboardConfirm,
    onFocusDate,
    onMoveDay,
    onMoveFocus,
    onMoveMonth: shiftIndex,
    onOpenMonthMenu,
    onOpenYearMenu,
    startYear,
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
        <View style={sharedStyles.hug}>
          {renderItem({
            active: true,
            index,
            onNext,
            onPrev,
          })}
          {renderHeader ? renderHeader(renderProps) : null}
        </View>
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
  const theme = useTheme()

  const parentRef = useRef<HTMLDivElement | null>(null)

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

  const [monthWindow, setMonthWindow] = useState<{
    indexes: number[]
    slots: MonthSlot[]
  }>(() => {
    const indexes = getVerticalWindow(
      constrainedInitialIndex,
      effectiveStartYear,
      effectiveEndYear
    )
    return { indexes, slots: assignMonthSlots([], indexes) }
  })

  const idx = useRef<number>(constrainedInitialIndex)

  const scrollerStyle: CSSProperties = {
    boxSizing: 'border-box',
    colorScheme: theme.dark ? 'dark' : 'light',
    height,
    overflow: 'auto',
    overflowAnchor: 'none',
    paddingRight: contentInset,
    scrollbarColor: `${themeColor(theme.colors.outline)} ${themeColor(
      theme.colors.surfaceContainerHigh
    )}`,
    width,
  }

  const verticalMetrics = useMemo(
    () =>
      getVerticalListMetrics(
        getMinIndex(effectiveStartYear, effectiveEndYear),
        getMaxIndex(effectiveStartYear, effectiveEndYear),
        startWeekOnMonday,
        effectiveStartYear,
        effectiveEndYear
      ),
    [effectiveEndYear, effectiveStartYear, startWeekOnMonday]
  )

  const trackStyle: CSSProperties = {
    height: verticalMetrics.height,
    position: 'relative',
  }

  const onScroll = (e: UIEvent) => {
    const top = e.currentTarget?.scrollTop
    if (top === undefined) {
      return
    }

    const index = indexFromVerticalScroll(
      top,
      verticalMetrics.origin,
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
    setMonthWindow((current) => {
      const indexes = nextVisibleIndexes(
        current.indexes,
        index,
        effectiveStartYear,
        effectiveEndYear
      )
      if (indexes === current.indexes) return current
      return {
        indexes,
        slots: assignMonthSlots(current.slots, indexes),
      }
    })
  }

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

  return (
    <div ref={parentRef} onScroll={onScroll} style={scrollerStyle}>
      <div style={trackStyle}>
        {monthWindow.slots.map(({ monthIndex, slot }) => {
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
            <div key={slot} style={monthStyle}>
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
