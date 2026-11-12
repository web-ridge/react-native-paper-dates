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
import { memo, useEffect, useRef } from 'react'
import { sharedStyles } from '../shared/styles'
import { defaultStartYear, defaultEndYear } from './dateUtils'

const ITEM_HEIGHT = 62

export default function YearPicker({
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

  const flatList = useRef<FlatList<number> | null>(null)
  const years = range(
    isNaN(startYear) ? defaultStartYear : startYear,
    isNaN(endYear) ? defaultEndYear : endYear
  )

  // scroll to selected year
  useEffect(() => {
    if (flatList.current && selectedYear) {
      const indexToGo = selectedYear - startYear
      flatList.current.scrollToOffset({
        offset: (indexToGo / 3) * ITEM_HEIGHT - ITEM_HEIGHT,
        animated: false,
      })
    }
  }, [flatList, selectedYear, startYear])

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
        keyExtractor={(item) => `${item}`}
        numColumns={3}
        ref={flatList}
        renderItem={({ item }) => (
          <Year
            onPressYear={onPressYear}
            selected={selectedYear === item}
            year={item}
          />
        )}
        renderScrollComponent={(sProps) => {
          return <ScrollView {...sProps} />
        }}
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
              { ...textFont },
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
