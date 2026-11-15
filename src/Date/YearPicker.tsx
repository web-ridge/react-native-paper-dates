import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native'
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper'
import { range, themeColor } from '../shared/utils'
import { memo, useCallback, useMemo } from 'react'
import { sharedStyles } from '../shared/styles'
import { defaultEndYear, defaultStartYear } from './dateUtils'

const COLUMNS = 3
const ROW_HEIGHT = 48

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    flex: 1,
    height: ROW_HEIGHT,
    justifyContent: 'center',
  },
  row: {
    height: ROW_HEIGHT,
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
  yearButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  yearInner: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 72,
  },
})

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
        menu={variant === 'menu'}
        onPressYear={onPressYear}
        selected={selectedYear === item}
        year={item}
      />
    ),
    [onPressYear, selectedYear, variant]
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
      columnWrapperStyle={variant === 'grid' ? styles.row : undefined}
      data={years}
      getItemLayout={getItemLayout}
      initialScrollIndex={Math.max(initialScrollIndex, 0)}
      key={variant}
      keyExtractor={keyExtractor}
      numColumns={columns}
      renderItem={renderItem}
      renderScrollComponent={renderScrollComponent}
      style={[
        styles.list,
        Platform.OS === 'web' && typeof theme.colors.outline === 'string'
          ? ({
              scrollbarColor: `${themeColor(theme.colors.outline)} transparent`,
            } as ViewStyle)
          : null,
      ]}
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
  menu,
  onPressYear,
  selected,
  year,
}: {
  menu: boolean
  onPressYear: (newYear: number) => void
  selected: boolean
  year: number
}) {
  const theme = useTheme()
  const textFont = theme.fonts.bodyLarge
  const color = selected
    ? menu
      ? theme.colors.onSurface
      : theme.colors.onPrimary
    : menu
      ? theme.colors.onSurface
      : theme.colors.onSurfaceVariant

  return (
    <View style={menu ? undefined : styles.cell}>
      <TouchableRipple
        accessibilityLabel={String(year)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onPressYear(year)}
        style={menu ? undefined : styles.yearButton}
      >
        {menu ? (
          <View
            style={[
              styles.menuInner,
              selected
                ? { backgroundColor: theme.colors.surfaceVariant }
                : null,
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
        ) : (
          <View
            style={[
              styles.yearInner,
              selected ? { backgroundColor: theme.colors.primary } : null,
            ]}
          >
            <Text
              maxFontSizeMultiplier={1.5}
              selectable={false}
              style={[textFont, { color }]}
            >
              {year}
            </Text>
          </View>
        )}
      </TouchableRipple>
    </View>
  )
}

const Year = memo(YearPure)

export default memo(YearPicker)
