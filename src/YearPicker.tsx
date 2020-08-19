import * as React from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { Text, TouchableRipple, useTheme } from 'react-native-paper'

const startYear = 1900
const endYear = 4000
const years = range(startYear, endYear)

export default function YearPicker({
  selectedYear,
  selectingYear,
  onPressYear,
}: {
  selectedYear: number | undefined
  selectingYear: boolean
  onPressYear: (year: number) => any
}) {
  const flatList = React.useRef<FlatList<number> | null>(null)
  const wasSelectingYear = usePrevious(selectingYear)

  // scroll to selected year
  React.useEffect(() => {
    // if user tries to select a year
    if (!wasSelectingYear && selectingYear && selectedYear) {
      if (flatList.current) {
        const indexToGo = selectedYear - startYear
        flatList.current.scrollToOffset({
          offset: (indexToGo / 3) * 62,
          animated: false,
        })
      }
    }
  }, [flatList, wasSelectingYear, selectedYear, selectingYear])

  return (
    <View
      style={[styles.root, selectingYear ? styles.opacity1 : styles.opacity0]}
      pointerEvents={selectingYear ? 'auto' : 'none'}
    >
      <FlatList<number>
        ref={flatList}
        style={styles.list}
        data={years}
        renderItem={({ item }) => (
          <Year
            year={item}
            selected={selectedYear === item}
            onPressYear={onPressYear}
          />
        )}
        numColumns={3}
      />
    </View>
  )
}

export function Year({
  year,
  selected,
  onPressYear,
}: {
  year: number
  selected: boolean
  onPressYear: (year: number) => any
}) {
  const theme = useTheme()
  return (
    <View style={styles.year}>
      <TouchableRipple
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
            style={[styles.yearLabel, selected ? styles.selectedYear : null]}
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
    // @ts-ignore
    ...StyleSheet.absoluteFill,
    backgroundColor: '#fff',
    flex: 1,
    top: 56,
    zIndex: 100,
  },

  list: {
    flex: 1,
  },
  year: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    height: 62,
    justifyContent: 'center',
  },
  selectedYear: { color: '#fff' },
  yearButton: {
    borderRadius: 46 / 2,
  },
  yearInner: {
    borderRadius: 46 / 2,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearLabel: {
    fontSize: 16,
  },
  opacity0: {
    opacity: 0,
  },
  opacity1: {
    opacity: 0,
  },
})

function range(start: number, end: number) {
  return Array(end - start + 1)
    .fill(null)
    .map((_, i) => start + i)
}

// Hook
function usePrevious<T>(value: T) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = React.useRef<T>()

  // Store current value in ref
  React.useEffect(() => {
    ref.current = value
  }, [value]) // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current
}
