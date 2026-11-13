import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native'
import { Text, TouchableRipple, useTheme } from 'react-native-paper'
import { range } from '../shared/utils'
import { memo, useCallback, useMemo } from 'react'
import { sharedStyles } from '../shared/styles'
import { defaultEndYear, defaultStartYear } from './dateUtils'

const ITEM_HEIGHT = 62

function YearPicker({
  endYear,
  onPressYear,
  selectedYear,
  selectingYear,
  startYear,
}: {
  endYear: number
  onPressYear: (year: number) => any
  selectedYear: number | undefined
  selectingYear: boolean
  startYear: number
}) {
  const theme = useTheme()

  const resolvedStartYear = isNaN(startYear) ? defaultStartYear : startYear
  const selectedRow = useMemo(() => {
    if (!selectedYear) {
      return 0
    }
    return Math.max(0, Math.floor((selectedYear - resolvedStartYear) / 3) - 1)
  }, [resolvedStartYear, selectedYear])
  const years = useMemo(
    () => range(resolvedStartYear, isNaN(endYear) ? defaultEndYear : endYear),
    [endYear, resolvedStartYear]
  )

  const getItemLayout = useCallback(
    (_: ArrayLike<number> | null | undefined, index: number) => ({
      index,
      length: ITEM_HEIGHT,
      offset: index * ITEM_HEIGHT,
    }),
    []
  )

  const keyExtractor = useCallback((item: number) => `${item}`, [])

  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <Year
        onPressYear={onPressYear}
        selected={selectedYear === item}
        year={item}
      />
    ),
    [onPressYear, selectedYear]
  )

  const renderScrollComponent = useCallback((sProps: object) => {
    return <ScrollView {...sProps} />
  }, [])

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
      <FlatList<number>
        data={years}
        getItemLayout={getItemLayout}
        initialScrollIndex={selectedRow}
        keyExtractor={keyExtractor}
        numColumns={3}
        renderItem={renderItem}
        renderScrollComponent={renderScrollComponent}
        style={[
          sharedStyles.root,
          Platform.OS === 'web'
            ? ({ colorScheme: theme.dark ? 'dark' : 'light' } as ViewStyle)
            : null,
        ]}
      />
    </View>
  )
}

function YearPure({
  onPressYear,
  selected,
  year,
}: {
  onPressYear: (newYear: number) => any
  selected: boolean
  year: number
}) {
  const theme = useTheme()

  const textFont = theme.fonts.bodyLarge

  return (
    <View style={styles.year}>
      <TouchableRipple
        accessibilityLabel={String(year)}
        accessibilityRole="button"
        onPress={() => onPressYear(year)}
        style={styles.yearButton}
      >
        <View
          style={[
            styles.yearInner,
            selected ? { backgroundColor: theme.colors.primary } : null,
          ]}
        >
          <Text
            maxFontSizeMultiplier={1.5}
            selectable={false}
            style={[
              styles.yearLabel,
              selected
                ? { color: theme.colors.onPrimary }
                : { color: theme.colors.onSurfaceVariant },
              textFont,
            ]}
          >
            {year}
          </Text>
        </View>
      </TouchableRipple>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    top: 56,
    zIndex: 100,
  },
  year: {
    flex: 1,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    marginLeft: 16,
    marginRight: 16,
  },
  yearButton: {
    borderRadius: 46 / 2,
    overflow: 'hidden',
  },
  yearInner: {
    alignItems: 'center',
    borderRadius: 46 / 2,
    height: 46,
    justifyContent: 'center',
  },
  yearLabel: {
    fontSize: 16,
  },
})
const Year = memo(YearPure)

export default memo(YearPicker)
