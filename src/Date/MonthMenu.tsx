import { type ComponentRef, memo, useEffect, useMemo, useRef } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper'

import { scrollbarThumb } from '../shared/utils'

function MonthMenu({
  embedded = false,
  locale,
  onPressMonth,
  selectedMonth,
}: {
  embedded?: boolean
  locale: string | undefined
  onPressMonth: (month: number) => void
  selectedMonth: number | undefined
}) {
  const listRef = useRef<ComponentRef<typeof ScrollView>>(null)
  const theme = useTheme()
  useEffect(() => {
    if (selectedMonth == null) return
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        animated: false,
        y: Math.max(0, (selectedMonth - 2) * 48),
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedMonth])
  const months = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { month: 'long' })
    return Array.from({ length: 12 }, (_, month) => ({
      label: formatter.format(new Date(2020, month, 1)),
      month,
    }))
  }, [locale])

  const list = (
    <ScrollView
      ref={listRef}
      style={[
        embedded ? styles.fill : styles.overlayList,
        scrollbarThumb(theme.colors.outline),
      ]}
    >
      {months.map(({ label, month }) => {
        const selected = selectedMonth === month
        return (
          <TouchableRipple
            key={month}
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onPressMonth(month)}
          >
            <View
              style={[
                styles.item,
                selected
                  ? { backgroundColor: theme.colors.surfaceVariant }
                  : null,
              ]}
            >
              <View style={styles.check}>
                {selected ? (
                  <Icon
                    color={theme.colors.onSurface}
                    size={24}
                    source="check"
                  />
                ) : null}
              </View>
              <Text
                maxFontSizeMultiplier={1.5}
                style={{ color: theme.colors.onSurface }}
                variant="bodyLarge"
              >
                {label}
              </Text>
            </View>
          </TouchableRipple>
        )
      })}
    </ScrollView>
  )

  if (embedded) return list

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.overlay,
        { backgroundColor: theme.colors.elevation.level3 },
      ]}
    >
      {list}
    </View>
  )
}

const styles = StyleSheet.create({
  check: {
    width: 24,
  },
  fill: {
    flex: 1,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  overlay: {
    top: 56,
    zIndex: 100,
  },
  overlayList: {
    flex: 1,
  },
})

export default memo(MonthMenu)
