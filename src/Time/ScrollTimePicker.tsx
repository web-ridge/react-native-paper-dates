import { memo, useContext, useEffect, useRef, useState } from 'react'
import {
  type ColorValue,
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import Animated, {
  Extrapolation,
  interpolate,
  scrollTo as reanimatedScrollTo,
  type SharedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { TimePickerPlacementContext } from '../contexts/TimePickerPlacementContext'
import StateLayer from '../shared/StateLayer'
import { useLatest, withAlpha } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import AmPmSwitcher from './AmPmSwitcher'
import FocusRing from './FocusRing'
import TimeSeparator from './TimeSeparator'
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

const minLoopSideRoom = 3840
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
      <TimeSeparator color={dotColor} height={fieldHeight} />
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
  const isAndroid = Platform.OS === 'android'
  const theme = useTheme()
  const [hovered, setHovered] = useState(false)
  const [initialOffset] = useState(() => ({
    x: 0,
    y: centeredIndex * scrollItemHeight,
  }))
  const [pressed, setPressed] = useState(false)
  // Mount the loop copies around the visible cycle after the first paint so
  // toggling to the wheels is not blocked on hundreds of rows.
  const [offscreenCopiesMounted, setOffscreenCopiesMounted] = useState(false)
  const scrollY = useSharedValue(centeredIndex * scrollItemHeight)
  const coastingValue = useSharedValue(false)
  const draggingValue = useSharedValue(false)
  const coasting = useRef(false)
  const listRef = useAnimatedRef<Animated.ScrollView>()
  const onChangeRef = useLatest(onChange)
  const valueRef = useLatest(value)
  const valuesRef = useLatest(values)

  const setCoasting = (next: boolean) => {
    coasting.current = next
    coastingValue.set(next)
  }
  const scrollList = (y: number) => {
    scrollY.set(y)
    listRef.current?.scrollTo({ animated: false, y })
  }

  useEffect(() => {
    const y = centeredIndex * scrollItemHeight
    scrollY.set(y)
    listRef.current?.scrollTo({ animated: false, y })
  }, [centeredIndex, listRef, scrollY])

  useEffect(() => {
    setOffscreenCopiesMounted(true)
  }, [])

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

  const pendingSettle = useRef(false)
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearSettleTimer = () => {
    if (settleTimer.current == null) return
    clearTimeout(settleTimer.current)
    settleTimer.current = null
  }

  useEffect(() => {
    return () => {
      clearSettleTimer()
    }
  }, [])

  const selectIndex = (index: number) => {
    if (disabled) return
    const normalized = ((index % count) + count) % count
    const next = values[normalized]
    if (next !== value) onChange(next)
    const middle = centerCopy * count + normalized
    scrollList(middle * scrollItemHeight)
  }

  const onWrapJs = useLatest((shifted: number) => {
    if (coasting.current) return
    scrollList(shifted)
  })
  const onGestureJs = useLatest({
    begin: () => {
      pendingSettle.current = false
      clearSettleTimer()
      setCoasting(false)
    },
    coast: () => {
      pendingSettle.current = false
      clearSettleTimer()
      setCoasting(true)
    },
    // Android generic motion (trackpad/mouse wheel ACTION_SCROLL) emits
    // onMomentumScrollBegin without a touch drag. Keep coasting false here so
    // the loop keeps wrapping instead of running out of track and bubbling
    // unconsumed wheel events to a parent ScrollView.
    momentumBegin: () => {
      pendingSettle.current = false
      clearSettleTimer()
    },
    settle: (y: number) => {
      pendingSettle.current = false
      clearSettleTimer()
      setCoasting(false)
      selectIndex(Math.round(y / scrollItemHeight))
    },
    // Momentum may still start after a release with no velocity. Wait briefly
    // before settling, so a hard Android touch fling is not stopped by scrollTo.
    release: (y: number) => {
      if (pendingSettle.current) return
      clearSettleTimer()
      setCoasting(true)
      pendingSettle.current = true
      settleTimer.current = setTimeout(() => {
        settleTimer.current = null
        if (pendingSettle.current) onGestureJs.current.settle(y)
      }, 32)
    },
  })
  const [dispatchWrap] = useState(() => (shifted: number) => {
    onWrapJs.current(shifted)
  })
  const [dispatchGesture] = useState(() => (kind: number, y: number) => {
    if (kind === 1) onGestureJs.current.coast()
    else if (kind === 2) onGestureJs.current.settle(y)
    else if (kind === 3) onGestureJs.current.release(y)
    else if (kind === 4) onGestureJs.current.momentumBegin()
    else onGestureJs.current.begin()
  })
  const scrollHandler = useAnimatedScrollHandler(
    {
      onBeginDrag: () => {
        draggingValue.set(true)
        coastingValue.set(false)
        scheduleOnRN(dispatchGesture, 0, 0)
      },
      onEndDrag: (event) => {
        draggingValue.set(false)
        // Set coasting on the UI thread immediately so the first momentum frame
        // cannot wrap with scrollTo and stop Android's OverScroller.
        coastingValue.set(true)
        scheduleOnRN(
          dispatchGesture,
          (event.velocity?.y ?? 0) !== 0 ? 1 : 3,
          event.contentOffset.y
        )
      },
      onMomentumBegin: () => {
        draggingValue.set(false)
        scheduleOnRN(dispatchGesture, 4, 0)
      },
      onMomentumEnd: (event) => {
        coastingValue.set(false)
        scheduleOnRN(dispatchGesture, 2, event.contentOffset.y)
      },
      onScroll: (event) => {
        const y = event.contentOffset.y
        scrollY.set(y)
        const shifted = wheelShift(
          y,
          count,
          copies,
          isAndroid,
          draggingValue.get(),
          coastingValue.get()
        )
        if (shifted !== y) {
          scrollY.set(shifted)
          if (globalThis._WORKLET) {
            reanimatedScrollTo(listRef, 0, shifted, false)
          } else {
            scheduleOnRN(dispatchWrap, shifted)
          }
        }
      },
    },
    Platform.OS === 'web'
      ? [copies, count, dispatchGesture, dispatchWrap, isAndroid, listRef]
      : undefined
  )

  const finishWheel = (offset: number) => {
    selectIndex(Math.round(offset / scrollItemHeight))
  }
  const gestureRef = useLatest({
    copies,
    count,
    onFocus,
    onSettle: finishWheel,
  })

  useEffect(() => {
    if (disabled || Platform.OS !== 'web') return
    const node = asWheelTarget(listRef.current)
    if (!node) return
    return bindTrackpadWheel(node, gestureRef)
  }, [disabled, gestureRef, listRef])

  const step = (delta: number) => {
    if (disabled) return
    onChange(values[(values.indexOf(value) + delta + count) % count])
  }
  const wheelStyle = [
    styles.wheel,
    {
      height: fieldHeight,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.shapes.corner.large,
    },
  ]
  const restColor = disabled
    ? withAlpha(theme.colors.onSurface, disabledContentOpacity)
    : theme.colors.outline
  const activeColor = disabled
    ? withAlpha(theme.colors.onSurface, disabledContentOpacity)
    : theme.colors.onSurface

  return (
    <View style={[styles.wheelFrame, { height: fieldHeight }]}>
      <FocusRing
        focused={focused && !disabled}
        radius={theme.shapes.corner.large}
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
        <Animated.ScrollView
          ref={listRef}
          contentContainerStyle={{
            paddingVertical: (fieldHeight - scrollItemHeight) / 2,
          }}
          bounces={false}
          contentOffset={initialOffset}
          decelerationRate="fast"
          importantForAccessibility="no-hide-descendants"
          nestedScrollEnabled
          onMomentumScrollBegin={() => {
            onGestureJs.current.momentumBegin()
          }}
          onMomentumScrollEnd={(event) => {
            onGestureJs.current.settle(event.nativeEvent.contentOffset.y)
          }}
          onScroll={scrollHandler}
          onScrollBeginDrag={() => {
            onGestureJs.current.begin()
          }}
          onScrollEndDrag={(event) => {
            if ((event.nativeEvent.velocity?.y ?? 0) !== 0) {
              onGestureJs.current.coast()
              return
            }
            onGestureJs.current.release(event.nativeEvent.contentOffset.y)
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
          {wheelRows({
            activeColor,
            activeFont: theme.fonts.displayLargeEmphasized,
            centeredIndex,
            copies,
            count,
            disabled,
            offscreenCopiesMounted,
            restColor,
            restFont: theme.fonts.displayMedium,
            scrollY,
            step,
            testID,
            values,
          })}
        </Animated.ScrollView>
      </View>
    </View>
  )
}

// Each row stacks the two M3 text styles, the emphasized display large for
// the centered value and display medium for the rest, and cross-fades them
// from the scroll offset on the UI thread. At rest exactly one shows, so the
// wheel looks as it did when the active row was React state. These are
// React Native texts: Paper's Text exposes no host view to Reanimated, and
// the row sets every font and color value Paper's Text would.
const WheelRow = memo(function WheelRow({
  activeColor,
  activeFont,
  disabled,
  label,
  listIndex,
  onPress,
  restColor,
  restFont,
  scrollY,
  testID,
}: {
  activeColor: ColorValue
  activeFont: TextStyle
  disabled?: boolean
  label: string
  listIndex: number
  onPress?: () => void
  restColor: ColorValue
  restFont: TextStyle
  scrollY: SharedValue<number>
  testID?: string
}) {
  const activeStyle = useAnimatedStyle(() => ({
    opacity: rowEmphasis(scrollY.value, listIndex),
  }))
  const restStyle = useAnimatedStyle(() => ({
    opacity: 1 - rowEmphasis(scrollY.value, listIndex),
  }))
  const text = (
    <>
      <Animated.Text
        maxFontSizeMultiplier={1.2}
        selectable={false}
        style={[restFont, styles.value, { color: restColor }, restStyle]}
      >
        {label}
      </Animated.Text>
      <View pointerEvents="none" style={styles.activeValue}>
        <Animated.Text
          maxFontSizeMultiplier={1.2}
          selectable={false}
          style={[
            activeFont,
            styles.value,
            { color: activeColor },
            activeStyle,
          ]}
        >
          {label}
        </Animated.Text>
      </View>
    </>
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

function wheelRows({
  activeColor,
  activeFont,
  centeredIndex,
  copies,
  count,
  disabled,
  offscreenCopiesMounted,
  restColor,
  restFont,
  scrollY,
  step,
  testID,
  values,
}: {
  activeColor: ColorValue
  activeFont: TextStyle
  centeredIndex: number
  copies: number
  count: number
  disabled?: boolean
  offscreenCopiesMounted: boolean
  restColor: ColorValue
  restFont: TextStyle
  scrollY: SharedValue<number>
  step: (delta: number) => void
  testID: string
  values: readonly number[]
}) {
  const centerCopy = Math.floor(copies / 2)
  const startCopy = offscreenCopiesMounted ? 0 : centerCopy
  const copyCount = offscreenCopiesMounted ? copies : 1
  const cycleHeight = count * scrollItemHeight
  const topHeight = startCopy * cycleHeight
  const bottomHeight = (copies - startCopy - copyCount) * cycleHeight
  const rows = Array.from({ length: copyCount * count }, (_, offset) => {
    const listIndex = startCopy * count + offset
    const copy = Math.floor(listIndex / count)
    const item = values[listIndex - copy * count]
    const neighbor =
      listIndex === centeredIndex - 1 || listIndex === centeredIndex + 1
    return (
      <WheelRow
        activeColor={activeColor}
        activeFont={activeFont}
        disabled={disabled}
        key={`${copy}-${item}`}
        label={padTime(item)}
        listIndex={listIndex}
        onPress={neighbor ? () => step(listIndex - centeredIndex) : undefined}
        restColor={restColor}
        restFont={restFont}
        scrollY={scrollY}
        testID={
          neighbor
            ? `${testID}-${listIndex < centeredIndex ? 'previous' : 'next'}`
            : undefined
        }
      />
    )
  })
  return (
    <>
      {topHeight > 0 ? (
        <View
          accessibilityElementsHidden
          collapsable={false}
          importantForAccessibility="no-hide-descendants"
          style={{ height: topHeight }}
        />
      ) : null}
      {rows}
      {bottomHeight > 0 ? (
        <View
          accessibilityElementsHidden
          collapsable={false}
          importantForAccessibility="no-hide-descendants"
          style={{ height: bottomHeight }}
        />
      ) : null}
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

function isWheelTarget(node: unknown): node is WheelTarget {
  if (!node || typeof node !== 'object') return false
  const candidate = node as WheelTarget
  return (
    typeof candidate.addEventListener === 'function' &&
    typeof candidate.removeEventListener === 'function' &&
    typeof candidate.scrollTop === 'number'
  )
}

// 1 for the row at the center, 0 from half a row away, cross-fading over the
// middle of the move so the emphasis changes where the row snaps.
export function rowEmphasis(scrollY: number, listIndex: number) {
  'worklet'
  const distance = Math.abs(scrollY / scrollItemHeight - listIndex)
  return interpolate(distance, [0.25, 0.75], [1, 0], Extrapolation.CLAMP)
}

// Where the loop moves an offset to keep it away from the ends. Android
// recenters only between flings (a scrollTo mid-fling stops it) and only
// once it is a full cycle off center. Elsewhere it waits for the finger to
// lift and recenters near the ends.
export function wheelShift(
  y: number,
  count: number,
  copies: number,
  isAndroid: boolean,
  dragging: boolean,
  coasting: boolean
) {
  'worklet'
  const cycle = count * scrollItemHeight
  const center = Math.floor(copies / 2) * cycle
  if (isAndroid) {
    if (coasting || Math.abs(y - center) < cycle) return y
  } else if (dragging) {
    return y
  } else {
    const margin = scrollItemHeight * 30
    const limit = (copies * count - 1) * scrollItemHeight - margin
    if (y >= margin && y <= limit) return y
  }
  const within = y - Math.floor(y / cycle) * cycle
  return center + within
}

export function loopCopies(count: number) {
  const cycle = count * scrollItemHeight
  const side = Math.max(2, Math.ceil(minLoopSideRoom / cycle))
  return side * 2 + 1
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
  activeValue: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
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
