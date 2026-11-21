import { memo, useCallback, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import StateLayer from '../shared/StateLayer'
import { sharedStyles } from '../shared/styles'
import { range, scrollbarThumb } from '../shared/utils'
import FocusRing from '../Time/FocusRing'
import { calendarControlHeight } from './CalendarHeader'
import SelectionMenuItem, { selectionMenuItemHeight } from './SelectionMenuItem'
import { defaultEndYear, defaultStartYear } from './dateUtils'

const COLUMNS = 3
const YEAR_HEIGHT = 36
const YEAR_ROW_GAP = 16
const ROW_HEIGHT = YEAR_HEIGHT + YEAR_ROW_GAP

function YearPicker({
  embedded = false,
  endYear,
  onPressYear,
  selectedYear,
  selectingYear,
  startYear,
  variant = 'grid',
}: {
  embedded?: boolean
  endYear: number
  onPressYear: (year: number) => void
  selectedYear: number | undefined
  selectingYear: boolean
  startYear: number
  variant?: 'grid' | 'menu'
}) {
  const columns = variant === 'grid' ? COLUMNS : 1
  const rowHeight = variant === 'menu' ? selectionMenuItemHeight : ROW_HEIGHT
  const todayYear = new Date().getFullYear()
  const getItemLayout = useCallback(
    (_: ArrayLike<number> | null | undefined, index: number) => ({
      index,
      length: rowHeight,
      offset: index * rowHeight,
    }),
    [rowHeight]
  )
  const keyExtractor = useCallback((item: number) => `${item}`, [])
  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <Year
        current={item === todayYear}
        menu={variant === 'menu'}
        onPressYear={onPressYear}
        selected={selectedYear === item}
        year={item}
      />
    ),
    [onPressYear, selectedYear, todayYear, variant]
  )
  const renderScrollComponent = useCallback((sProps: object) => {
    return <ScrollView {...sProps} />
  }, [])

  const resolvedStartYear = isNaN(startYear) ? defaultStartYear : startYear

  const selectedIndex = useMemo(() => {
    if (!selectedYear) {
      return 0
    }
    return Math.max(0, selectedYear - resolvedStartYear)
  }, [resolvedStartYear, selectedYear])
  const theme = useTheme()
  const years = useMemo(
    () => range(resolvedStartYear, isNaN(endYear) ? defaultEndYear : endYear),
    [endYear, resolvedStartYear]
  )

  const rowCount = Math.max(Math.ceil(years.length / columns), 1)
  const initialScrollIndex = Math.min(
    Math.floor(selectedIndex / columns),
    rowCount - 1
  )
  const scrollIndex = Math.max(initialScrollIndex, 0)
  const [contentOffset] = useState(() => ({
    x: 0,
    y: scrollIndex * rowHeight,
  }))
  const listReady = useRef({ laidOut: false, sized: false })
  const listRef = useRef<FlatList<number>>(null)
  const revealed = useRef(false)
  const revealYear = useCallback(() => {
    if (
      !listReady.current.laidOut ||
      !listReady.current.sized ||
      revealed.current
    ) {
      return
    }
    if (scrollIndex <= 0) {
      revealed.current = true
      return
    }
    if (!listRef.current) return
    revealed.current = true
    const scroll = () => {
      listRef.current?.scrollToIndex({ animated: false, index: scrollIndex })
    }
    scroll()
    requestAnimationFrame(scroll)
  }, [scrollIndex])
  const onListContentSizeChange = useCallback(
    (_width: number, height: number) => {
      if (height <= 0) return
      listReady.current.sized = true
      revealYear()
    },
    [revealYear]
  )
  const onListLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (event.nativeEvent.layout.height <= 0) return
      listReady.current.laidOut = true
      revealYear()
    },
    [revealYear]
  )

  const list = (
    <FlatList<number>
      key={variant}
      ref={listRef}
      columnWrapperStyle={variant === 'grid' ? styles.row : undefined}
      contentOffset={contentOffset}
      data={years}
      getItemLayout={getItemLayout}
      initialScrollIndex={scrollIndex}
      keyExtractor={keyExtractor}
      numColumns={columns}
      onContentSizeChange={onListContentSizeChange}
      onLayout={onListLayout}
      removeClippedSubviews={false}
      renderItem={renderItem}
      renderScrollComponent={renderScrollComponent}
      style={[styles.list, scrollbarThumb(theme.colors.outline)]}
    />
  )

  if (embedded) {
    return list
  }

  return (
    <View
      pointerEvents={selectingYear ? 'auto' : 'none'}
      testID="react-native-paper-dates-year-picker"
      style={[
        StyleSheet.absoluteFill,
        styles.root,
        { backgroundColor: theme.colors.surfaceContainerHigh },
        selectingYear ? sharedStyles.opacity1 : sharedStyles.opacity0,
      ]}
    >
      {list}
    </View>
  )
}

function YearPure({
  current,
  menu,
  onPressYear,
  selected,
  year,
}: {
  current: boolean
  menu: boolean
  onPressYear: (newYear: number) => void
  selected: boolean
  year: number
}) {
  const [hovered, setHovered] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [pressed, setPressed] = useState(false)
  const theme = useTheme()
  const textFont = theme.fonts.bodyLarge
  const color = selected
    ? theme.colors.onPrimary
    : current
      ? theme.colors.primary
      : theme.colors.onSurfaceVariant
  const label = String(year)

  if (menu) {
    return (
      <SelectionMenuItem
        label={label}
        onPress={() => onPressYear(year)}
        selected={selected}
      />
    )
  }

  return (
    <View style={styles.cell}>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        android_ripple={{ color: 'transparent' }}
        onBlur={() => setInputFocused(false)}
        onFocus={() => setInputFocused(true)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPress={() => onPressYear(year)}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={styles.yearButton}
      >
        <View
          style={[
            styles.yearInner,
            current && !selected ? { borderColor: theme.colors.primary } : null,
            selected ? { backgroundColor: theme.colors.primary } : null,
          ]}
        >
          <StateLayer
            color={
              selected
                ? theme.colors.onPrimary
                : current
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
            }
            focused={inputFocused}
            hovered={hovered}
            pressed={pressed}
          />
          <Text
            maxFontSizeMultiplier={1.5}
            selectable={false}
            style={[textFont, { color }]}
          >
            {year}
          </Text>
        </View>
        <FocusRing focused={inputFocused} radius={18} />
      </Pressable>
    </View>
  )
}

const Year = memo(YearPure)

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    flex: 1,
    height: ROW_HEIGHT,
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  root: {
    flex: 1,
    top: calendarControlHeight,
    zIndex: 100,
  },
  row: {
    height: ROW_HEIGHT,
  },
  yearButton: {
    height: 36,
    width: 72,
  },
  yearInner: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72,
  },
})

export default memo(YearPicker)
