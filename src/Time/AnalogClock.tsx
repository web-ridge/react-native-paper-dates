import { memo, useContext, useRef, useState } from 'react'
import {
  GestureResponderEvent,
  PanResponder,
  Platform,
  StyleSheet,
  View,
  type ViewInstance,
} from 'react-native'
import { useTheme } from 'react-native-paper'

import { DisplayModeContext } from '../contexts/DisplayModeContext'
import { useLatest, withAlpha } from '../shared/utils'
import AnalogClockHours from './AnalogClockHours'
import AnalogClockMinutes from './AnalogClockMinutes'
import AnimatedClockSwitcher from './AnimatedClockSwitcher'
import FocusRing from './FocusRing'
import {
  circleSize,
  clockTypes,
  disabledContentOpacity,
  getAngle,
  getHourType,
  getHourTypeFromOffset,
  getHours,
  getMinutes,
  hourTypes,
  type PossibleClockTypes,
  type TimeChange,
} from './timeUtils'

function AnalogClock({
  disabled,
  focused,
  hours,
  is24Hour,
  locale,
  minutes,
  onChange,
}: {
  disabled?: boolean
  focused: PossibleClockTypes
  hours: number
  is24Hour: boolean
  locale?: string
  minutes: number
  onChange: TimeChange
}) {
  const clockRef = useRef<ViewInstance | null>(null)
  const degreesPerNumber = focused === clockTypes.hours ? 30 : 6
  const { mode } = useContext(DisplayModeContext)
  const latest = useLatest<ClockValues>({
    disabled,
    focused,
    hours,
    is24Hour,
    minutes,
    mode,
    onChange,
  })
  const [panResponder] = useState(() => createClockResponder(latest))
  const pointerNumber = focused === clockTypes.hours ? hours : minutes
  const shortPointer = hours >= 12 && is24Hour
  const dynamicSize = focused === clockTypes.hours && shortPointer ? 33 : 0
  const theme = useTheme()
  const selectorColor = disabled
    ? withAlpha(theme.colors.primary, disabledContentOpacity)
    : theme.colors.primary
  const [clockFocused, setClockFocused] = useState(false)
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  const [numberFocused, setNumberFocused] = useState(false)
  const [selectedNumberFocused, setSelectedNumberFocused] = useState(false)
  const onNumberFocus = (isFocused: boolean, selected: boolean) => {
    setNumberFocused(isFocused)
    if (selected) setSelectedNumberFocused(isFocused)
  }
  const onHoursPress = (nextHours: number) => {
    const current = latest.current
    if (current.disabled) return
    current.onChange({
      focused: clockTypes.minutes,
      hours: nextHours,
      minutes: current.minutes,
    })
  }
  const onMinutesPress = (nextMinutes: number) => {
    const current = latest.current
    if (current.disabled) return
    current.onChange({ hours: current.hours, minutes: nextMinutes })
  }

  return (
    <View
      ref={clockRef}
      {...panResponder.panHandlers}
      {...(disabled
        ? {
            'accessibilityState': { disabled: true },
            'aria-disabled': true,
            'pointerEvents': 'none' as const,
          }
        : null)}
      accessible
      focusable={!disabled}
      onBlur={(event) => {
        if (Platform.OS === 'web' && !isOwnFocus(event, clockRef.current)) {
          return
        }
        setClockFocused(false)
      }}
      onFocus={(event) => {
        if (disabled) return
        if (Platform.OS === 'web' && !isOwnFocus(event, clockRef.current)) {
          return
        }
        setClockFocused(true)
      }}
      onMouseLeave={() => setHoveredValue(null)}
      onPointerMove={(event) => {
        if (disabled) return
        setHoveredValue(
          selectionAt(
            event.nativeEvent.offsetX,
            event.nativeEvent.offsetY,
            focused,
            hours,
            is24Hour,
            mode
          )
        )
      }}
      style={[
        styles.clock,
        {
          backgroundColor: theme.colors.surfaceContainerLowest,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.line,
          {
            backgroundColor: selectorColor,
            transform: [
              { rotate: -90 + pointerNumber * degreesPerNumber + 'deg' },
              {
                translateX:
                  circleSize / 4 -
                  (focused === clockTypes.hours &&
                  pointerNumber >= 0 &&
                  pointerNumber < 13
                    ? 0
                    : 4) +
                  (focused === clockTypes.minutes ? 4 : 0) -
                  dynamicSize / 2,
              },
            ],
            width: circleSize / 2 - 4 - dynamicSize,
          },
        ]}
      >
        <View style={[styles.endPoint, { backgroundColor: selectorColor }]}>
          {hoveredValue === pointerNumber && !disabled ? (
            <View
              pointerEvents="none"
              style={[
                styles.handleHover,
                { backgroundColor: withAlpha(theme.colors.onPrimary, 0.08) },
              ]}
            />
          ) : null}
          <FocusRing
            focused={
              !disabled &&
              (selectedNumberFocused || (clockFocused && !numberFocused))
            }
            radius={24}
          />
        </View>
      </View>
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.center]}
      >
        <View
          style={[
            styles.middlePoint,
            {
              backgroundColor: selectorColor,
            },
          ]}
        />
      </View>
      <AnimatedClockSwitcher
        focused={focused}
        hours={
          <AnalogClockHours
            disabled={disabled}
            hours={hours}
            hoveredHour={
              disabled || focused !== clockTypes.hours ? null : hoveredValue
            }
            is24Hour={is24Hour}
            locale={locale}
            onNumberFocus={onNumberFocus}
            onPress={onHoursPress}
          />
        }
        minutes={
          <AnalogClockMinutes
            disabled={disabled}
            hoveredMinute={
              disabled || focused !== clockTypes.minutes ? null : hoveredValue
            }
            locale={locale}
            minutes={minutes}
            onNumberFocus={onNumberFocus}
            onPress={onMinutesPress}
          />
        }
      />
    </View>
  )
}

type ClockValues = {
  disabled?: boolean
  focused: PossibleClockTypes
  hours: number
  is24Hour: boolean
  minutes: number
  mode: string | undefined
  onChange: TimeChange
}

function selectionAt(
  x: number,
  y: number,
  focused: PossibleClockTypes,
  hours: number,
  is24Hour: boolean,
  mode: string | undefined
) {
  const angle = getAngle(x, y, circleSize)
  if (focused !== clockTypes.hours) return getMinutes(angle)
  const hours12AndPm = !is24Hour && mode === 'PM'
  const hourTypeFromOffset = getHourTypeFromOffset(x, y, circleSize)
  const hours24AndPM = is24Hour && hourTypeFromOffset === hourTypes.pm
  let pickedHours = getHours(angle, getHourType(hours))
  if (hours12AndPm || hours24AndPM) pickedHours += 12
  if ((mode === 'AM' || is24Hour) && pickedHours === 12) pickedHours = 0
  if (pickedHours === 24) pickedHours = 12
  return pickedHours
}

function createClockResponder(latest: { readonly current: ClockValues }) {
  const onPointerMove = (e: GestureResponderEvent, final: boolean) => {
    const current = latest.current
    if (current.disabled) return
    const { focused, hours, minutes, onChange } = current
    if (focused !== clockTypes.hours && focused !== clockTypes.minutes) return
    const picked = selectionAt(
      e.nativeEvent.locationX,
      e.nativeEvent.locationY,
      focused,
      hours,
      current.is24Hour,
      current.mode
    )
    if (focused === clockTypes.hours) {
      if (hours !== picked || final) {
        onChange({
          focused: final ? clockTypes.minutes : undefined,
          hours: picked,
          minutes,
        })
      }
    } else if (minutes !== picked) {
      onChange({ hours, minutes: picked })
    }
  }
  const enabled = () => !latest.current.disabled
  return PanResponder.create({
    onMoveShouldSetPanResponder: enabled,
    onMoveShouldSetPanResponderCapture: enabled,
    onPanResponderGrant: (e) => onPointerMove(e, false),
    onPanResponderMove: (e) => onPointerMove(e, false),
    onPanResponderRelease: (e) => onPointerMove(e, true),
    onPanResponderTerminationRequest: returnTrue,
    onShouldBlockNativeResponder: returnTrue,
    onStartShouldSetPanResponder: enabled,
    onStartShouldSetPanResponderCapture: () => false,
  })
}

function isOwnFocus(
  event: { nativeEvent?: { target?: unknown } },
  node: ViewInstance | null
) {
  const target = event.nativeEvent?.target
  return target == null || node == null || target === node
}

function returnTrue() {
  return true
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clock: {
    alignItems: 'center',
    borderRadius: circleSize / 2,
    cursor: 'pointer',
    height: circleSize,
    justifyContent: 'center',
    position: 'relative',
    width: circleSize,
  },
  endPoint: {
    borderRadius: 24,
    bottom: -23,
    height: 48,
    position: 'absolute',
    right: 0,
    width: 48,
  },
  handleHover: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
  },
  line: {
    borderRadius: 4,
    height: 2,
    position: 'absolute',
  },
  middlePoint: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
})

export default memo(AnalogClock)
