import { memo, useCallback, useMemo, useState } from 'react'
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper'

import StateLayer from '../shared/StateLayer'
import { sharedStyles } from '../shared/styles'
import { range, scrollbarThumb } from '../shared/utils'
import { defaultEndYear, defaultStartYear } from './dateUtils'

const COLUMNS = 3
const ROW_HEIGHT = 48

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
      style={[
        StyleSheet.absoluteFill,
        styles.root,
        { backgroundColor: theme.colors.elevation.level3 },
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
    ? menu
      ? theme.colors.onSurface
      : theme.colors.onPrimary
    : current && !menu
      ? theme.colors.primary
      : menu
        ? theme.colors.onSurface
        : theme.colors.onSurfaceVariant
  const label = String(year)

  if (menu) {
    return (
      <TouchableRipple
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onPressYear(year)}
      >
        <View
          style={[
            styles.menuInner,
            selected ? { backgroundColor: theme.colors.surfaceVariant } : null,
          ]}
        >
          <View style={styles.menuCheck}>
            {selected ? (
              <Icon color={theme.colors.onSurface} size={24} source="check" />
            ) : null}
          </View>
          <Text
            maxFontSizeMultiplier={1.5}
            selectable={false}
            style={{ color }}
            variant="bodyLarge"
          >
            {year}
          </Text>
        </View>
      </TouchableRipple>
    )
  }

  return (
    <View style={styles.cell}>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ selected }}
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
              selected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant
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
  menuCheck: {
    width: 24,
  },
  menuInner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    minHeight: ROW_HEIGHT,
    paddingHorizontal: 16,
    width: '100%',
  },
  root: {
    flex: 1,
    top: 56,
    zIndex: 100,
  },
  row: {
    height: ROW_HEIGHT,
  },
  yearButton: {
    borderRadius: 18,
    overflow: 'hidden',
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
