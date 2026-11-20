import { memo, useContext, useEffect, useRef, useState } from 'react'
import {
  type ColorValue,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'

import { TimePickerPlacementContext } from '../contexts/TimePickerPlacementContext'
import StateLayer from '../shared/StateLayer'
import { useLatest, withAlpha } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import AmPmSwitcher from './AmPmSwitcher'
import FocusRing from './FocusRing'
import {
  clockTypes,
  disabledContentOpacity,
  inputTypes,
  modalScrollFieldHeight,
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

type AncestorHold = {
  count: number
  onScroll: () => void
  overflow: string
  top: number
}

type ScrollChainNode = {
  addEventListener?: (
    type: 'scroll',
    listener: () => void,
    options?: boolean | AddEventListenerOptions
  ) => void
  clientHeight: number
  ownerDocument?: {
    defaultView?: {
      getComputedStyle?: (node: ScrollChainNode) => { overflowY?: string }
    } | null
    scrollingElement?: ScrollChainNode | null
  } | null
  parentElement?: ScrollChainNode | null
  removeEventListener?: (type: 'scroll', listener: () => void) => void
  scrollHeight: number
  scrollTop: number
  style?: { overflowY?: string }
}

type WheelGesture = {
  copies: number
  count: number
  onFocus: () => void
  onSettle: (offset: number) => void
  onStart?: () => void
}

type WheelTarget = {
  addEventListener: (
    type: 'pointerenter' | 'pointerleave' | 'wheel',
    listener: (event: WheelEvent) => void,
    options?: boolean | AddEventListenerOptions
  ) => void
  ownerDocument?: {
    defaultView?: {
      getComputedStyle?: (node: ScrollChainNode) => { overflowY?: string }
    } | null
    scrollingElement?: ScrollChainNode | null
  } | null
  parentElement?: ScrollChainNode | null
  removeEventListener: (
    type: 'pointerenter' | 'pointerleave' | 'wheel',
    listener: (event: WheelEvent) => void,
    options?: boolean | EventListenerOptions
  ) => void
  scrollTop: number
  style?: { overscrollBehavior?: string }
}

const androidFlingRoom = 10000
const ancestorHolds = new Map<ScrollChainNode, AncestorHold>()
const hourValues12 = Array.from({ length: 12 }, (_, hour) => hour + 1)
const hourValues24 = Array.from({ length: 24 }, (_, hour) => hour)
const minuteValues = Array.from({ length: 60 }, (_, minute) => minute)
const wheelSettleDelay = 120

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
  const placement = useContext(TimePickerPlacementContext)
  const fieldHeight =
    placement === 'modal' ? modalScrollFieldHeight : scrollFieldHeight
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
        fieldHeight={fieldHeight}
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
      <View style={[styles.separator, { height: fieldHeight }]}>
        <SeparatorDots color={dotColor} />
      </View>
      <ScrollWheel
        accessibilityLabel={rangeLabel(minuteLabel, minuteValues)}
        disabled={disabled}
        fieldHeight={fieldHeight}
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
              // Keep the focused field; switching AM/PM only changes hours.
              onChange({
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

function ScrollWheel({
  accessibilityLabel,
  disabled,
  fieldHeight,
  focused,
  onChange,
  onFocus,
  testID,
  value,
  values,
}: {
  accessibilityLabel: string
  disabled?: boolean
  fieldHeight: number
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
  const theme = useTheme()
  const [centered, setCentered] = useState(centeredIndex)
  const [hovered, setHovered] = useState(false)
  const [initialOffset] = useState(() => ({
    x: 0,
    y: centeredIndex * scrollItemHeight,
  }))
  const [pressed, setPressed] = useState(false)
  const coasting = useRef(false)
  const dragging = useRef(false)
  const listRef = useRef<ScrollViewInstance | null>(null)
  const onChangeRef = useLatest(onChange)
  const settledY = useRef<number | null>(null)
  const valueRef = useLatest(value)
  const valuesRef = useLatest(values)

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
    const y = middle * scrollItemHeight
    settledY.current = y
    setCentered(middle)
    listRef.current?.scrollTo({ animated: false, y })
    requestAnimationFrame(() => {
      if (settledY.current !== y || dragging.current || coasting.current) return
      listRef.current?.scrollTo({ animated: false, y })
    })
  }

  const shiftIntoCenter = (y: number) => {
    const cycle = count * scrollItemHeight
    const center = centerCopy * cycle
    if (Platform.OS === 'android') {
      if (coasting.current || Math.abs(y - center) < cycle) return y
    } else if (dragging.current) {
      return y
    } else {
      const margin = scrollItemHeight * 30
      const limit = (copies * count - 1) * scrollItemHeight - margin
      if (y >= margin && y <= limit) return y
    }
    const within = y - Math.floor(y / cycle) * cycle
    const next = center + within
    if (next === y) return y
    listRef.current?.scrollTo({ animated: false, y: next })
    return next
  }

  const finishWheel = (offset: number) => {
    selectIndex(Math.round(offset / scrollItemHeight))
  }
  const gestureRef = useLatest({
    copies,
    count,
    onFocus,
    onSettle: finishWheel,
    onStart: () => {
      settledY.current = null
    },
  })

  useEffect(() => {
    if (disabled || Platform.OS !== 'web') return
    const node = asWheelTarget(listRef.current)
    if (!node) return
    return bindTrackpadWheel(node, gestureRef)
  }, [disabled, gestureRef])

  const step = (delta: number) => {
    if (disabled) return
    onChange(values[(values.indexOf(value) + delta + count) % count])
  }
  const wheelStyle = [
    styles.wheel,
    {
      height: fieldHeight,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.shapes.corner.medium,
    },
  ]

  return (
    <View style={[styles.wheelFrame, { height: fieldHeight }]}>
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
          contentContainerStyle={{
            paddingVertical: (fieldHeight - scrollItemHeight) / 2,
          }}
          bounces={false}
          contentOffset={initialOffset}
          decelerationRate="fast"
          importantForAccessibility="no-hide-descendants"
          nestedScrollEnabled
          onMomentumScrollEnd={(event) => {
            coasting.current = false
            selectIndex(offsetIndex(event))
          }}
          onScroll={(event) => {
            const y = event.nativeEvent.contentOffset.y
            const parked = settledY.current
            if (parked != null && !dragging.current && !coasting.current) {
              if (Math.abs(y - parked) > 0.5) {
                listRef.current?.scrollTo({ animated: false, y: parked })
              }
              return
            }
            const shifted = shiftIntoCenter(y)
            if (shifted !== y) return
            setCentered(offsetIndex(event))
          }}
          onScrollBeginDrag={() => {
            coasting.current = false
            dragging.current = true
            settledY.current = null
          }}
          onScrollEndDrag={(event) => {
            dragging.current = false
            if ((event.nativeEvent.velocity?.y ?? 0) !== 0) {
              coasting.current = true
              settledY.current = null
              return
            }
            coasting.current = false
            selectIndex(offsetIndex(event))
          }}
          overScrollMode="never"
          scrollEnabled={!disabled}
          scrollEventThrottle={16}
          scrollsToTop={false}
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
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

function SeparatorDots({ color }: { color: ColorValue }) {
  return (
    <>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.dotGap} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </>
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
      : theme.colors.outline
  const type = active
    ? theme.fonts.displayLargeEmphasized
    : theme.fonts.displayMedium
  const text = (
    <Text
      maxFontSizeMultiplier={1.2}
      selectable={false}
      style={[type, styles.value, { color }]}
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

export function asWheelTarget(node: unknown): WheelTarget | null {
  if (node && typeof node === 'object' && 'getScrollableNode' in node) {
    const read = (node as { getScrollableNode?: unknown }).getScrollableNode
    if (typeof read === 'function') {
      try {
        const host = read.call(node)
        if (isWheelTarget(host)) return host
      } catch {
        return null
      }
    }
  }
  return isWheelTarget(node) ? node : null
}

export function bindTrackpadWheel(
  node: WheelTarget,
  state: { current: WheelGesture }
) {
  if (node.style) node.style.overscrollBehavior = 'none'
  let gesturing = false
  let hovering = false
  let release: (() => void) | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  const syncHold = () => {
    if (hovering || gesturing) {
      if (!release) release = holdAncestors(node)
      pinHeldScroll(node)
      return
    }
    release?.()
    release = null
  }
  const onEnter = () => {
    hovering = true
    syncHold()
  }
  const onLeave = () => {
    hovering = false
    syncHold()
  }
  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.deltaY === 0) return
    gesturing = true
    syncHold()
    event.stopPropagation()
    // Settling parks the row so a late Android frame cannot leave it off
    // center. A new trackpad gesture has to release that park first, or the
    // wheel snaps back and will not move again.
    state.current.onStart?.()
    if (event.cancelable !== false) {
      event.preventDefault()
      const gesture = state.current
      gesture.onFocus()
      node.scrollTop = wrappedWheelOffset(
        node.scrollTop + wheelDelta(event.deltaY, event.deltaMode),
        gesture.count,
        gesture.copies
      )
    }
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      gesturing = false
      syncHold()
      state.current.onSettle(node.scrollTop)
    }, wheelSettleDelay)
  }
  node.addEventListener('pointerenter', onEnter)
  node.addEventListener('pointerleave', onLeave)
  node.addEventListener('wheel', onWheel, { capture: true, passive: false })
  return () => {
    gesturing = false
    hovering = false
    release?.()
    release = null
    node.removeEventListener('pointerenter', onEnter)
    node.removeEventListener('pointerleave', onLeave)
    node.removeEventListener('wheel', onWheel, { capture: true })
    if (timer) clearTimeout(timer)
  }
}

function canHoldScroll(
  node: ScrollChainNode,
  scrolling: ScrollChainNode | null
) {
  return (
    !!node.style &&
    node.scrollHeight > node.clientHeight + 1 &&
    (overflowY(node) === 'auto' ||
      overflowY(node) === 'scroll' ||
      overflowY(node) === 'overlay' ||
      node === scrolling)
  )
}

function holdAncestors(node: {
  ownerDocument?: { scrollingElement?: ScrollChainNode | null } | null
  parentElement?: ScrollChainNode | null
}) {
  const scrolling = node.ownerDocument?.scrollingElement ?? null
  const held: ScrollChainNode[] = []
  let current = node.parentElement ?? null
  while (current) {
    const parent = current
    current = parent.parentElement ?? null
    const existing = ancestorHolds.get(parent)
    if (existing) {
      existing.count += 1
      held.push(parent)
      continue
    }
    if (!canHoldScroll(parent, scrolling)) continue
    const top = parent.scrollTop
    const onScroll = () => {
      if (parent.scrollTop !== top) parent.scrollTop = top
    }
    parent.addEventListener?.('scroll', onScroll)
    ancestorHolds.set(parent, {
      count: 1,
      onScroll,
      overflow: parent.style?.overflowY ?? '',
      top,
    })
    if (parent.style) parent.style.overflowY = 'hidden'
    held.push(parent)
  }
  let released = false
  return () => {
    if (released) return
    released = true
    held.forEach((parent) => {
      const existing = ancestorHolds.get(parent)
      if (!existing) return
      existing.count -= 1
      if (existing.count > 0) return
      parent.removeEventListener?.('scroll', existing.onScroll)
      if (parent.style) parent.style.overflowY = existing.overflow
      ancestorHolds.delete(parent)
    })
  }
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

function isWheelTarget(node: unknown): node is WheelTarget {
  if (!node || typeof node !== 'object') return false
  const candidate = node as WheelTarget
  return (
    typeof candidate.addEventListener === 'function' &&
    typeof candidate.removeEventListener === 'function' &&
    typeof candidate.scrollTop === 'number'
  )
}

export function loopCopies(count: number) {
  const side = Math.max(1, Math.ceil(60 / count))
  if (Platform.OS !== 'android') return side * 2 + 1
  const cycle = count * scrollItemHeight
  const flingSide = Math.ceil(androidFlingRoom / cycle)
  return Math.max(side, flingSide) * 2 + 1
}

function offsetIndex(event: NativeSyntheticEvent<NativeScrollEvent>) {
  return Math.round(event.nativeEvent.contentOffset.y / scrollItemHeight)
}

function overflowY(node: ScrollChainNode) {
  const computed = node.ownerDocument?.defaultView?.getComputedStyle?.(node)
  return computed?.overflowY ?? node.style?.overflowY ?? ''
}

function padTime(value: number) {
  return value < 10 ? `0${value}` : `${value}`
}

function pinHeldScroll(node: { parentElement?: ScrollChainNode | null }) {
  let current = node.parentElement ?? null
  while (current) {
    const hold = ancestorHolds.get(current)
    if (hold && current.scrollTop !== hold.top) current.scrollTop = hold.top
    current = current.parentElement ?? null
  }
}

function rangeLabel(name: string, values: readonly number[]) {
  return `${name}, ${padTime(values[0])} to ${padTime(values[values.length - 1])}`
}

function wheelDelta(deltaY: number, deltaMode: number) {
  if (deltaMode === 1) return deltaY * scrollItemHeight
  if (deltaMode === 2) return deltaY * scrollFieldHeight
  return deltaY
}

function wrappedWheelOffset(offset: number, count: number, copies: number) {
  const cycle = count * scrollItemHeight
  const within = offset - Math.floor(offset / cycle) * cycle
  return Math.floor(copies / 2) * cycle + within
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: timeColonSize / 2,
    height: timeColonSize,
    width: timeColonSize,
  },
  dotGap: {
    height: 6,
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
  separator: {
    alignItems: 'center',
    justifyContent: 'center',
    width: timeSeparatorWidth,
  },
  sideKeyboard: {
    alignSelf: 'center',
    marginLeft: periodSelectorGap,
  },
  value: {
    lineHeight: scrollItemHeight,
    textAlign: 'center',
  },
  wheel: {
    overflow: 'hidden',
    width: scrollFieldWidth,
  },
  wheelFrame: {
    overflow: 'visible',
    width: scrollFieldWidth,
  },
  wheelScroller: {
    flex: 1,
    ...(Platform.OS === 'web'
      ? ({ overscrollBehavior: 'none' } as ViewStyle)
      : {}),
  },
})

export default memo(ScrollTimePicker)
