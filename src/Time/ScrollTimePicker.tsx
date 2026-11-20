import { memo, useEffect, useRef, useState } from 'react'
import {
  type ColorValue,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'

import StateLayer from '../shared/StateLayer'
import { useLatest, withAlpha } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import AmPmSwitcher from './AmPmSwitcher'
import FocusRing from './FocusRing'
import {
  clockTypes,
  disabledContentOpacity,
  inputTypes,
  periodSelectorGap,
  type PossibleClockTypes,
  scrollFieldHeight,
  scrollFieldWidth,
  scrollItemHeight,
  type TimeChange,
  timeColonSize,
  timeSeparatorWidth,
  toHourInputFormat,
  toHourOutputFormat,
} from './timeUtils'

// Shorter wheels need more repeats so a spin has about as much room as the
// minute wheel before either end. The centered copy is restored after the
// gesture, which keeps 12 followed by 01 instead of a blank edge.
function loopCopies(count: number) {
  const side = Math.max(1, Math.ceil(60 / count))
  return side * 2 + 1
}

function ScrollTimePicker({
  disabled,
  focused,
  hours,
  is24Hour,
  keyboardIcon = 'keyboard',
  locale,
  minutes,
  onChange,
  onFocusInput,
  onToggleKeyboard,
  showKeyboardToggle = true,
}: {
  disabled?: boolean
  focused: PossibleClockTypes
  hours: number
  is24Hour: boolean
  keyboardIcon?: string
  locale?: string
  minutes: number
  onChange: TimeChange
  onFocusInput: (type: PossibleClockTypes) => void
  onToggleKeyboard: () => void
  showKeyboardToggle?: boolean
}) {
  const theme = useTheme()
  const dotColor = disabled
    ? withAlpha(theme.colors.onSurface, disabledContentOpacity)
    : theme.colors.onSurface
  const hourLabel = getTranslation(locale, 'hour', 'Hour')
  const minuteLabel = getTranslation(locale, 'minute', 'Minute')
  const hourValues = is24Hour ? hourValues24 : hourValues12
  const wheelHour = toHourInputFormat(hours, is24Hour)

  return (
    <View style={styles.row}>
      <ScrollWheel
        accessibilityLabel={rangeLabel(hourLabel, hourValues)}
        disabled={disabled}
        focused={focused === clockTypes.hours}
        onChange={(wheelHourNext) => {
          onChange({
            focused: clockTypes.hours,
            hours: hoursFromWheel(wheelHourNext, hours, is24Hour),
            minutes,
          })
        }}
        onFocus={() => onFocusInput(clockTypes.hours)}
        testID="time-scroll-hours"
        value={wheelHour}
        values={hourValues}
      />
      <View style={styles.separator}>
        <SeparatorDots color={dotColor} />
      </View>
      <ScrollWheel
        accessibilityLabel={rangeLabel(minuteLabel, minuteValues)}
        disabled={disabled}
        focused={focused === clockTypes.minutes}
        onChange={(nextMinutes) => {
          onChange({
            focused: clockTypes.minutes,
            hours,
            minutes: nextMinutes,
          })
        }}
        onFocus={() => onFocusInput(clockTypes.minutes)}
        testID="time-scroll-minutes"
        value={minutes}
        values={minuteValues}
      />
      {!is24Hour ? (
        <View style={styles.period}>
          <AmPmSwitcher
            direction="vertical"
            disabled={disabled}
            hours={hours}
            inputType={inputTypes.scroll}
            locale={locale}
            onChange={(nextHours) => {
              onChange({
                focused: clockTypes.hours,
                hours: nextHours,
                minutes,
              })
            }}
          />
          {showKeyboardToggle ? (
            <KeyboardToggle
              disabled={disabled}
              icon={keyboardIcon}
              iconColor={theme.colors.onSurfaceVariant}
              locale={locale}
              onPress={onToggleKeyboard}
            />
          ) : null}
        </View>
      ) : showKeyboardToggle ? (
        <KeyboardToggle
          disabled={disabled}
          icon={keyboardIcon}
          iconColor={theme.colors.onSurfaceVariant}
          locale={locale}
          onPress={onToggleKeyboard}
          style={styles.sideKeyboard}
        />
      ) : null}
    </View>
  )
}

function ScrollWheel({
  accessibilityLabel,
  disabled,
  focused,
  onChange,
  onFocus,
  testID,
  value,
  values,
}: {
  accessibilityLabel: string
  disabled?: boolean
  focused: boolean
  onChange: (value: number) => void
  onFocus: () => void
  testID: string
  value: number
  values: readonly number[]
}) {
  const count = values.length
  const copies = loopCopies(count)
  const centerCopy = Math.floor(copies / 2)
  const valueIndex = values.indexOf(value)
  const centeredIndex = centerCopy * count + Math.max(0, valueIndex)
  const listRef = useRef<ScrollViewInstance | null>(null)
  const [centered, setCentered] = useState(centeredIndex)
  const onChangeRef = useLatest(onChange)
  const valueRef = useLatest(value)
  const valuesRef = useLatest(values)
  const theme = useTheme()
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const dragging = useRef(false)
  const spun = useRef(false)
  const [initialOffset] = useState(() => ({
    x: 0,
    y: centeredIndex * scrollItemHeight,
  }))

  useEffect(() => {
    listRef.current?.scrollTo({
      animated: false,
      y: centeredIndex * scrollItemHeight,
    })
    setCentered(centeredIndex)
  }, [centeredIndex])

  useEffect(() => {
    if (disabled || !focused || Platform.OS !== 'web') return
    const target = globalThis.window
    if (!target?.addEventListener || !target.removeEventListener) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTextField(event.target)) return
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
      event.preventDefault()
      const list = valuesRef.current
      const current = list.indexOf(valueRef.current)
      const delta = event.key === 'ArrowDown' ? 1 : -1
      onChangeRef.current(list[(current + delta + list.length) % list.length])
    }
    target.addEventListener('keydown', onKeyDown)
    return () => target.removeEventListener('keydown', onKeyDown)
  }, [disabled, focused, onChangeRef, valueRef, valuesRef])

  const selectIndex = (index: number) => {
    if (disabled) return
    const normalized = ((index % count) + count) % count
    const next = values[normalized]
    if (next !== value) onChange(next)
    const middle = centerCopy * count + normalized
    setCentered(middle)
    if (index !== middle) {
      listRef.current?.scrollTo({
        animated: false,
        y: middle * scrollItemHeight,
      })
    }
  }

  // While the wheel is coasting, jump by whole cycles before the blank edge.
  // Repeated rows match, so 12 continues into 01 without a visible seam.
  const shiftIntoCenter = (y: number) => {
    if (dragging.current || !spun.current) return y
    const margin = scrollItemHeight * 30
    const limit = (copies * count - 1) * scrollItemHeight - margin
    if (y >= margin && y <= limit) return y
    const cycle = count * scrollItemHeight
    const within = y - Math.floor(y / cycle) * cycle
    const next = centerCopy * cycle + within
    listRef.current?.scrollTo({ animated: false, y: next })
    return next
  }

  const step = (delta: number) => {
    if (disabled) return
    onChange(values[(values.indexOf(value) + delta + count) % count])
  }
  const wheelStyle = [
    styles.wheel,
    {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.shapes.corner.medium,
    },
  ]

  return (
    <View style={styles.wheelFrame}>
      <FocusRing
        focused={focused && !disabled}
        radius={theme.shapes.corner.medium}
      />
      <View
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="adjustable"
        accessibilityState={{
          disabled: disabled || undefined,
          selected: focused,
        }}
        aria-disabled={disabled ? true : undefined}
        accessibilityValue={{
          max: values[count - 1],
          min: values[0],
          now: value,
          text: padTime(value),
        }}
        accessible
        focusable={!disabled}
        onAccessibilityAction={(event) => {
          if (disabled) return
          if (event.nativeEvent.actionName === 'increment') step(1)
          if (event.nativeEvent.actionName === 'decrement') step(-1)
        }}
        onFocus={() => {
          if (!disabled) onFocus()
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false)
          setPressed(false)
        }}
        onTouchCancel={() => setPressed(false)}
        onTouchEnd={() => setPressed(false)}
        onTouchStart={() => {
          if (disabled) return
          setPressed(true)
          onFocus()
        }}
        style={wheelStyle}
        testID={`${testID}-control`}
      >
        <StateLayer
          color={theme.colors.onSurface}
          focused={!disabled && focused}
          hovered={!disabled && hovered}
          pressed={!disabled && pressed}
        />
        <ScrollView
          ref={listRef}
          contentContainerStyle={styles.wheelContent}
          bounces={false}
          contentOffset={initialOffset}
          decelerationRate="fast"
          importantForAccessibility="no-hide-descendants"
          nestedScrollEnabled
          onMomentumScrollEnd={(event) => selectIndex(offsetIndex(event))}
          onScroll={(event) => {
            const y = shiftIntoCenter(event.nativeEvent.contentOffset.y)
            if (y !== event.nativeEvent.contentOffset.y) return
            setCentered(offsetIndex(event))
          }}
          onScrollBeginDrag={() => {
            dragging.current = true
            spun.current = true
          }}
          onScrollEndDrag={(event) => {
            dragging.current = false
            if ((event.nativeEvent.velocity?.y ?? 0) !== 0) return
            selectIndex(offsetIndex(event))
          }}
          overScrollMode="never"
          scrollEnabled={!disabled}
          scrollEventThrottle={16}
          scrollsToTop={false}
          showsVerticalScrollIndicator={false}
          snapToInterval={scrollItemHeight}
          style={styles.wheelScroller}
          testID={testID}
        >
          {Array.from({ length: copies }, (_, copy) =>
            values.map((item, index) => {
              const listIndex = copy * count + index
              const neighbor =
                listIndex === centered - 1 || listIndex === centered + 1
              return (
                <WheelRow
                  active={listIndex === centered}
                  disabled={disabled}
                  key={`${copy}-${item}`}
                  label={padTime(item)}
                  onPress={
                    neighbor ? () => step(listIndex - centered) : undefined
                  }
                  testID={
                    neighbor
                      ? `${testID}-${listIndex < centered ? 'previous' : 'next'}`
                      : undefined
                  }
                />
              )
            })
          )}
        </ScrollView>
      </View>
    </View>
  )
}

const WheelRow = memo(function WheelRow({
  active,
  disabled,
  label,
  onPress,
  testID,
}: {
  active: boolean
  disabled?: boolean
  label: string
  onPress?: () => void
  testID?: string
}) {
  const theme = useTheme()
  const color = disabled
    ? withAlpha(theme.colors.onSurface, disabledContentOpacity)
    : active
      ? theme.colors.onSurface
      : theme.colors.onSurfaceVariant
  const type = active ? theme.fonts.displayMedium : theme.fonts.headlineMedium
  const text = (
    <Text
      maxFontSizeMultiplier={1.5}
      selectable={false}
      style={[
        type,
        styles.value,
        active ? styles.selectedValue : styles.idleValue,
        { color },
      ]}
    >
      {label}
    </Text>
  )
  if (!onPress) return <View style={styles.item}>{text}</View>
  return (
    <Pressable
      accessible={false}
      disabled={disabled}
      importantForAccessibility="no"
      onPress={onPress}
      style={styles.item}
      testID={testID}
    >
      {text}
    </Pressable>
  )
})

function KeyboardToggle({
  disabled,
  icon,
  iconColor,
  locale,
  onPress,
  style,
}: {
  disabled?: boolean
  icon: string
  iconColor: ColorValue
  locale?: string
  onPress: () => void
  style?: StyleProp<ViewStyle>
}) {
  return (
    <IconButton
      accessibilityLabel={getTranslation(
        locale,
        'toggleKeyboard',
        'Toggle input picker'
      )}
      disabled={disabled}
      icon={icon}
      iconColor={iconColor}
      onPress={onPress}
      size={24}
      style={[styles.keyboard, style]}
      testID="time-scroll-keyboard"
    />
  )
}

function SeparatorDots({ color }: { color: ColorValue }) {
  return (
    <>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.dotGap} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </>
  )
}

function hoursFromWheel(
  wheelHour: number,
  previousHours: number,
  is24Hour: boolean
) {
  if (!is24Hour && wheelHour === 12) {
    return previousHours >= 12 ? 12 : 0
  }
  return toHourOutputFormat(wheelHour, previousHours, is24Hour)
}

function isTextField(target: EventTarget | null) {
  if (!target || typeof target !== 'object' || !('tagName' in target)) {
    return false
  }
  const tag = String((target as { tagName?: string }).tagName)
  return tag === 'INPUT' || tag === 'TEXTAREA'
}

function offsetIndex(event: NativeSyntheticEvent<NativeScrollEvent>) {
  return Math.round(event.nativeEvent.contentOffset.y / scrollItemHeight)
}

function padTime(value: number) {
  return value < 10 ? `0${value}` : `${value}`
}

function rangeLabel(name: string, values: readonly number[]) {
  return `${name}, ${padTime(values[0])} to ${padTime(values[values.length - 1])}`
}

const hourValues12 = Array.from({ length: 12 }, (_, hour) => hour + 1)
const hourValues24 = Array.from({ length: 24 }, (_, hour) => hour)
const minuteValues = Array.from({ length: 60 }, (_, minute) => minute)

const styles = StyleSheet.create({
  dot: {
    borderRadius: timeColonSize / 2,
    height: timeColonSize,
    width: timeColonSize,
  },
  dotGap: {
    height: 6,
  },
  idleValue: {
    fontSize: 28,
  },
  item: {
    alignItems: 'center',
    height: scrollItemHeight,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  keyboard: {
    margin: 0,
  },
  sideKeyboard: {
    alignSelf: 'center',
    marginLeft: periodSelectorGap,
  },
  period: {
    alignItems: 'center',
    gap: 8,
    marginLeft: periodSelectorGap,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selectedValue: {
    fontSize: 45,
  },
  separator: {
    alignItems: 'center',
    height: scrollFieldHeight,
    justifyContent: 'center',
    width: timeSeparatorWidth,
  },
  value: {
    lineHeight: scrollItemHeight,
    textAlign: 'center',
  },
  wheel: {
    height: scrollFieldHeight,
    overflow: 'hidden',
    width: scrollFieldWidth,
  },
  wheelFrame: {
    height: scrollFieldHeight,
    overflow: 'visible',
    width: scrollFieldWidth,
  },
  wheelContent: {
    paddingVertical: (scrollFieldHeight - scrollItemHeight) / 2,
  },
  wheelScroller: {
    flex: 1,
  },
})

export default memo(ScrollTimePicker)
