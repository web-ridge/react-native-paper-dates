import { memo, useCallback, useMemo, useState } from 'react'
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import StateLayer from '../shared/StateLayer'
import { sharedStyles } from '../shared/styles'
import { range, scrollbarThumb } from '../shared/utils'
import FocusRing from '../Time/FocusRing'
import { calendarControlHeight } from './CalendarHeader'
import SelectionMenuItem from './SelectionMenuItem'
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
  const todayYear = new Date().getFullYear()
  const getItemLayout = useCallback(
    (_: ArrayLike<number> | null | undefined, index: number) => ({
      index,
      length: ROW_HEIGHT,
      offset: index * ROW_HEIGHT,
    }),
    []
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

  const list = (
    <FlatList<number>
      key={variant}
      columnWrapperStyle={variant === 'grid' ? styles.row : undefined}
      data={years}
      getItemLayout={getItemLayout}
      initialScrollIndex={Math.max(initialScrollIndex, 0)}
      keyExtractor={keyExtractor}
      numColumns={columns}
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
