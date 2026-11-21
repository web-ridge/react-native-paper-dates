import {
  memo,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
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
  interpolateColor,
  scrollTo as reanimatedScrollTo,
  type SharedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { TimePickerPlacementContext } from '../contexts/TimePickerPlacementContext'
import StateLayer from '../shared/StateLayer'
import { themeColor, useLatest, withAlpha } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import AmPmSwitcher from './AmPmSwitcher'
import FocusRing from './FocusRing'
import TimeSeparator from './TimeSeparator'
import {
  clockTypes,
  disabledContentOpacity,
  getTimeInputToggleLabel,
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

type WheelTarget = Pick<
  ScrollChainNode,
  'ownerDocument' | 'parentElement' | 'scrollTop'
> & {
  addEventListener: (
    type: 'pointerenter' | 'pointerleave' | 'wheel',
    listener: (event: WheelEvent) => void,
    options?: boolean | AddEventListenerOptions
  ) => void
  removeEventListener: (
    type: 'pointerenter' | 'pointerleave' | 'wheel',
    listener: (event: WheelEvent) => void,
    options?: boolean | EventListenerOptions
  ) => void
  style?: { overscrollBehavior?: string }
}

const androidRunway = 250000
const ancestorHolds = new Map<ScrollChainNode, AncestorHold>()
const hourValues12 = Array.from({ length: 12 }, (_, hour) => hour + 1)
const hourValues24 = Array.from({ length: 24 }, (_, hour) => hour)
const minLoopSideRoom = 3840
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
  visible = true,
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
  visible?: boolean
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
        visible={visible}
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
        visible={visible}
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
      accessibilityLabel={getTimeInputToggleLabel(locale, inputTypes.scroll)}
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
  visible,
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
  visible: boolean
}) {
  const count = values.length
  const isAndroid = Platform.OS === 'android'
  const rendered = loopCopies(count, isAndroid)
  const copies = wheelSpan(count, isAndroid)
  const centerCopy = Math.floor(copies / 2)
  const valueIndex = values.indexOf(value)
  const centeredIndex = centerCopy * count + Math.max(0, valueIndex)
  const theme = useTheme()
  const [hovered, setHovered] = useState(false)
  const [initialOffset] = useState(() => ({
    x: 0,
    y: centeredIndex * scrollItemHeight,
  }))
  const [pressed, setPressed] = useState(false)
  const [offscreenCopiesMounted, setOffscreenCopiesMounted] = useState(false)
  const scrollY = useSharedValue(centeredIndex * scrollItemHeight)
  const draggingValue = useSharedValue(false)
  const gestureEpoch = useSharedValue(0)
  const coasting = useRef(false)
  const draggingRef = useRef(false)
  const touchingRef = useRef(false)
  const epochRef = useRef(0)
  const workletLifecycle = useRef(false)
  const listRef = useAnimatedRef<Animated.ScrollView>()
  const onChangeRef = useLatest(onChange)
  const valueRef = useLatest(value)
  const valuesRef = useLatest(values)

  const lastEmitted = useRef(value)
  const emitValue = (next: number) => {
    if (next === lastEmitted.current) return
    lastEmitted.current = next
    onChange(next)
  }

  useEffect(() => {
    lastEmitted.current = value
  }, [value])
  const setCoasting = (next: boolean) => {
    coasting.current = next
  }
  const scrollList = (y: number) => {
    scrollY.set(y)
    listRef.current?.scrollTo({ animated: false, y })
  }

  useLayoutEffect(() => {
    if (!visible) return
    if (draggingRef.current || touchingRef.current || draggingValue.get()) {
      return
    }
    const y = centeredIndex * scrollItemHeight
    scrollY.set(y)
    listRef.current?.scrollTo({ animated: false, y })
  }, [
    centeredIndex,
    draggingValue,
    listRef,
    offscreenCopiesMounted,
    scrollY,
    visible,
  ])

  useEffect(() => {
    if (typeof requestAnimationFrame === 'function') {
      const frame = requestAnimationFrame(() => {
        setOffscreenCopiesMounted(true)
      })
      return () => {
        cancelAnimationFrame?.(frame)
      }
    }
    const timer = setTimeout(() => {
      setOffscreenCopiesMounted(true)
    }, 0)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (disabled || !focused || !visible || Platform.OS !== 'web') return
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
  }, [disabled, focused, onChangeRef, valueRef, valuesRef, visible])

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
    emitValue(values[normalized])
    scrollList((centerCopy * count + normalized) * scrollItemHeight)
  }

  const onWrapJs = useLatest((shifted: number) => {
    if (coasting.current) return
    scrollList(shifted)
  })
  const onGestureJs = useLatest({
    begin: (epoch?: number) => {
      pendingSettle.current = false
      clearSettleTimer()
      if (epoch !== undefined) {
        epochRef.current = epoch
      } else {
        epochRef.current += 1
        gestureEpoch.set(epochRef.current)
      }
      draggingRef.current = true
      setCoasting(false)
    },
    reset: () => {
      pendingSettle.current = false
      clearSettleTimer()
      draggingRef.current = false
      touchingRef.current = false
      setCoasting(false)
      draggingValue.set(false)
    },
    coast: () => {
      pendingSettle.current = false
      clearSettleTimer()
      draggingRef.current = false
      touchingRef.current = false
      setCoasting(true)
    },
    momentumBegin: () => {
      pendingSettle.current = false
      clearSettleTimer()
      draggingRef.current = false
      touchingRef.current = false
    },
    settle: (y: number, epoch?: number) => {
      pendingSettle.current = false
      clearSettleTimer()
      setCoasting(false)
      if (
        draggingRef.current ||
        touchingRef.current ||
        draggingValue.get() ||
        (epoch !== undefined && epoch !== epochRef.current) ||
        gestureEpoch.get() !== epochRef.current
      ) {
        return
      }
      selectIndex(Math.round(y / scrollItemHeight))
    },
    release: (y: number, epoch?: number) => {
      if (pendingSettle.current) return
      clearSettleTimer()
      draggingRef.current = false
      touchingRef.current = false
      setCoasting(true)
      const scheduledEpoch = epoch ?? epochRef.current
      pendingSettle.current = true
      settleTimer.current = setTimeout(() => {
        settleTimer.current = null
        if (pendingSettle.current) {
          onGestureJs.current.settle(y, scheduledEpoch)
        }
      }, 32)
    },
  })
  useEffect(() => {
    if (!visible) onGestureJs.current.reset()
  }, [onGestureJs, visible])

  const [dispatchWrap] = useState(() => (shifted: number) => {
    onWrapJs.current(shifted)
  })
  const [dispatchGesture] = useState(
    () => (kind: number, y: number, epoch: number, fromWorklet: boolean) => {
      if (fromWorklet) workletLifecycle.current = true
      if (kind === 1) onGestureJs.current.coast()
      else if (kind === 2) onGestureJs.current.settle(y, epoch)
      else if (kind === 3) onGestureJs.current.release(y, epoch)
      else if (kind === 4) onGestureJs.current.momentumBegin()
      else onGestureJs.current.begin(epoch)
    }
  )
  const scrollHandler = useAnimatedScrollHandler(
    {
      onBeginDrag: () => {
        draggingValue.set(true)
        const epoch = gestureEpoch.get() + 1
        gestureEpoch.set(epoch)
        scheduleOnRN(dispatchGesture, 0, 0, epoch, Boolean(globalThis._WORKLET))
      },
      onEndDrag: (event) => {
        draggingValue.set(false)
        scheduleOnRN(
          dispatchGesture,
          (event.velocity?.y ?? 0) !== 0 ? 1 : 3,
          event.contentOffset.y,
          gestureEpoch.get(),
          Boolean(globalThis._WORKLET)
        )
      },
      onMomentumBegin: () => {
        draggingValue.set(false)
        scheduleOnRN(
          dispatchGesture,
          4,
          0,
          gestureEpoch.get(),
          Boolean(globalThis._WORKLET)
        )
      },
      onMomentumEnd: (event) => {
        if (draggingValue.get()) return
        scheduleOnRN(
          dispatchGesture,
          2,
          event.contentOffset.y,
          gestureEpoch.get(),
          Boolean(globalThis._WORKLET)
        )
      },
      onScroll: (event) => {
        const y = event.contentOffset.y
        scrollY.set(y)
        const shifted = wheelShift(
          y,
          count,
          copies,
          isAndroid,
          draggingValue.get()
        )
        if (shifted === y) return
        if (!globalThis._WORKLET) {
          scrollY.set(shifted)
          scheduleOnRN(dispatchWrap, shifted)
          return
        }
        scrollY.set(shifted)
        reanimatedScrollTo(listRef, 0, shifted, false)
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
    if (disabled || !visible || Platform.OS !== 'web') return
    const node = asWheelTarget(listRef.current)
    if (!node) return
    return bindTrackpadWheel(node, gestureRef)
  }, [disabled, gestureRef, listRef, visible])

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
    : themeColor(theme.colors.outline)
  const activeColor = disabled
    ? withAlpha(theme.colors.onSurface, disabledContentOpacity)
    : themeColor(theme.colors.onSurface)

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
        onTouchCancel={() => {
          touchingRef.current = false
          setPressed(false)
        }}
        onTouchEnd={() => {
          touchingRef.current = false
          setPressed(false)
        }}
        onTouchStart={() => {
          if (disabled) return
          touchingRef.current = true
          pendingSettle.current = false
          clearSettleTimer()
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
          bounces={false}
          contentContainerStyle={{
            paddingVertical: (fieldHeight - scrollItemHeight) / 2,
          }}
          contentOffset={initialOffset}
          decelerationRate="fast"
          importantForAccessibility="no-hide-descendants"
          nestedScrollEnabled
          onMomentumScrollBegin={() => {
            if (workletLifecycle.current) return
            onGestureJs.current.momentumBegin()
          }}
          onMomentumScrollEnd={(event) => {
            if (workletLifecycle.current) return
            onGestureJs.current.settle(event.nativeEvent.contentOffset.y)
          }}
          onScroll={scrollHandler}
          onScrollBeginDrag={() => {
            if (workletLifecycle.current) return
            onGestureJs.current.begin()
          }}
          onScrollEndDrag={(event) => {
            if (workletLifecycle.current) return
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
            rendered,
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

const WheelRow = memo(function WheelRow({
  activeColor,
  activeFont,
  copies,
  count,
  disabled,
  label,
  listIndex,
  onPress,
  rendered,
  restColor,
  restFont,
  scrollY,
  testID,
}: {
  activeColor: string
  activeFont: TextStyle
  copies: number
  count: number
  disabled?: boolean
  label: string
  listIndex: number
  onPress?: () => void
  rendered: number
  restColor: string
  restFont: TextStyle
  scrollY: SharedValue<number>
  testID?: string
}) {
  const restScale = (restFont.fontSize ?? 45) / (activeFont.fontSize ?? 57)
  const emphasisValue = useDerivedValue(() => {
    const y = scrollY.value
    return rowEmphasis(y - blockOffset(y, count, copies, rendered), listIndex)
  })
  const rowStyle = useAnimatedStyle(() => {
    const emphasis = emphasisValue.value
    return {
      color: interpolateColor(emphasis, [0, 1], [restColor, activeColor]),
      transform: [
        {
          scale: interpolate(
            emphasis,
            [0, 1],
            [restScale, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    }
  })
  const text = (
    <Animated.Text
      maxFontSizeMultiplier={1.2}
      selectable={false}
      style={[activeFont, styles.value, rowStyle]}
    >
      {label}
    </Animated.Text>
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

function WheelBlock({
  children,
  copies,
  count,
  rendered,
  scrollY,
}: {
  children: ReactNode
  copies: number
  count: number
  rendered: number
  scrollY: SharedValue<number>
}) {
  const blockStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: blockOffset(scrollY.value, count, copies, rendered) },
    ],
  }))
  return <Animated.View style={blockStyle}>{children}</Animated.View>
}

function wheelRows({
  activeColor,
  activeFont,
  centeredIndex,
  copies,
  count,
  disabled,
  offscreenCopiesMounted,
  rendered,
  restColor,
  restFont,
  scrollY,
  step,
  testID,
  values,
}: {
  activeColor: string
  activeFont: TextStyle
  centeredIndex: number
  copies: number
  count: number
  disabled?: boolean
  offscreenCopiesMounted: boolean
  rendered: number
  restColor: string
  restFont: TextStyle
  scrollY: SharedValue<number>
  step: (delta: number) => void
  testID: string
  values: readonly number[]
}) {
  const restBlock = Math.floor(copies / 2) - Math.floor(rendered / 2)
  const center = centeredIndex - restBlock * count
  const centerCopy = Math.floor(rendered / 2)
  const totalRows = rendered * count
  const runway = (copies - rendered) * count * scrollItemHeight
  const startIndex = offscreenCopiesMounted
    ? 0
    : Math.max(0, centerCopy * count - 1)
  const endIndex = offscreenCopiesMounted
    ? totalRows
    : Math.min(totalRows, (centerCopy + 1) * count + 1)
  const topHeight = startIndex * scrollItemHeight
  const bottomHeight = (totalRows - endIndex) * scrollItemHeight
  const rows = Array.from({ length: endIndex - startIndex }, (_, offset) => {
    const listIndex = startIndex + offset
    const copy = Math.floor(listIndex / count)
    const item = values[listIndex - copy * count]
    const neighbor = listIndex === center - 1 || listIndex === center + 1
    return (
      <WheelRow
        activeColor={activeColor}
        activeFont={activeFont}
        copies={copies}
        count={count}
        disabled={disabled}
        key={`${copy}-${item}`}
        label={padTime(item)}
        listIndex={listIndex}
        onPress={neighbor ? () => step(listIndex - center) : undefined}
        rendered={rendered}
        restColor={restColor}
        restFont={restFont}
        scrollY={scrollY}
        testID={
          neighbor
            ? `${testID}-${listIndex < center ? 'previous' : 'next'}`
            : undefined
        }
      />
    )
  })
  return (
    <>
      <WheelBlock
        copies={copies}
        count={count}
        rendered={rendered}
        scrollY={scrollY}
      >
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
      </WheelBlock>
      {runway > 0 ? (
        <View
          accessibilityElementsHidden
          collapsable={false}
          importantForAccessibility="no-hide-descendants"
          style={{ height: runway }}
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

function rowEmphasis(scrollY: number, listIndex: number) {
  'worklet'
  const distance = Math.abs(scrollY / scrollItemHeight - listIndex)
  return interpolate(distance, [0.25, 0.75], [1, 0], Extrapolation.CLAMP)
}

function wheelShift(
  y: number,
  count: number,
  copies: number,
  isAndroid: boolean,
  dragging: boolean
) {
  'worklet'
  const cycle = count * scrollItemHeight
  const center = Math.floor(copies / 2) * cycle
  if (isAndroid || dragging) {
    return y
  } else {
    const margin = Math.min(scrollItemHeight * 30, cycle / 2)
    const limit = (copies * count - 1) * scrollItemHeight - margin
    if (y >= margin && y <= limit) return y
  }
  const within = y - Math.floor(y / cycle) * cycle
  return center + within
}

export function wheelSpan(
  count: number,
  isAndroid = Platform.OS === 'android'
) {
  const rendered = loopCopies(count, isAndroid)
  if (!isAndroid) return rendered
  const side = Math.ceil(androidRunway / (count * scrollItemHeight))
  return side * 2 + rendered
}

function blockOffset(
  y: number,
  count: number,
  copies: number,
  rendered: number
) {
  'worklet'
  const cycle = count * scrollItemHeight
  const last = copies - rendered
  if (last <= 0) return 0
  const start = Math.floor(y / cycle) - Math.floor(rendered / 2)
  return Math.min(last, Math.max(0, start)) * cycle
}

export function loopCopies(
  count: number,
  isAndroid = Platform.OS === 'android'
) {
  if (!isAndroid) {
    return count < 24 ? 5 : 3
  }
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
