import {
  type ComponentRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { useTheme } from 'react-native-paper'

import { dateTimeFormat } from '../shared/intl'
import { scrollbarThumb } from '../shared/utils'
import { calendarControlHeight } from './CalendarHeader'
import SelectionMenuItem, { selectionMenuItemHeight } from './SelectionMenuItem'

function monthScrollOffset(selectedMonth: number | undefined) {
  if (selectedMonth == null) return 0
  return Math.max(0, (selectedMonth - 2) * selectionMenuItemHeight)
}

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
  const theme = useTheme()

  const listRef = useRef<ComponentRef<typeof ScrollView>>(null)
  const ready = useRef({ laidOut: false, sized: false })
  const shownOffset = useRef<number | null>(null)

  const months = useMemo(() => {
    const formatter = dateTimeFormat(locale, { month: 'long' })
    return Array.from({ length: 12 }, (_, month) => ({
      label: formatter.format(new Date(2020, month, 1)),
      month,
    }))
  }, [locale])

  const offset = monthScrollOffset(selectedMonth)

  const [contentOffset] = useState(() => ({ x: 0, y: offset }))

  const offsetRef = useRef(offset)

  const revealMonth = useCallback(() => {
    if (!ready.current.laidOut || !ready.current.sized) return
    const y = offsetRef.current
    if (shownOffset.current === y || !listRef.current) return
    shownOffset.current = y
    const scroll = () => listRef.current?.scrollTo({ animated: false, y })
    scroll()
    requestAnimationFrame(scroll)
  }, [])

  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      if (height <= 0) return
      ready.current.sized = true
      revealMonth()
    },
    [revealMonth]
  )

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (event.nativeEvent.layout.height <= 0) return
      ready.current.laidOut = true
      revealMonth()
    },
    [revealMonth]
  )

  const list = (
    <ScrollView
      ref={listRef}
      contentOffset={contentOffset}
      onContentSizeChange={onContentSizeChange}
      onLayout={onLayout}
      style={[
        embedded ? styles.fill : styles.overlayList,
        scrollbarThumb(theme.colors.outline),
      ]}
    >
      {months.map(({ label, month }) => (
        <SelectionMenuItem
          key={month}
          label={label}
          onPress={() => onPressMonth(month)}
          selected={selectedMonth === month}
        />
      ))}
    </ScrollView>
  )

  useEffect(() => {
    offsetRef.current = offset
    revealMonth()
  }, [offset, revealMonth])

  if (embedded) return list

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.overlay,
        { backgroundColor: theme.colors.surfaceContainerHigh },
      ]}
    >
      {list}
    </View>
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  overlay: {
    top: calendarControlHeight,
    zIndex: 100,
  },
  overlayList: {
    flex: 1,
  },
})

export default memo(MonthMenu)
