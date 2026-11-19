import { memo, useCallback, useContext, useRef, useState } from 'react'
import {
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  View,
  type ViewInstance,
} from 'react-native'
import { useTheme } from 'react-native-paper'

import { DisplayModeContext } from '../contexts/DisplayModeContext'
import { useLatest, withAlpha } from '../shared/utils'
import FocusRing from './FocusRing'
import AnalogClockHours from './AnalogClockHours'
import AnalogClockMinutes from './AnalogClockMinutes'
import AnimatedClockSwitcher from './AnimatedClockSwitcher'
import {
  circleSize,
  clockTypes,
  disabledContentOpacity,
  getAngle,
  getHours,
  getHourType,
  getHourTypeFromOffset,
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
  const disabledRef = useLatest(disabled)
  const degreesPerNumber = focused === clockTypes.hours ? 30 : 6
  const focusedRef = useLatest(focused)
  const hoursRef = useLatest(hours)
  const is24HourRef = useLatest(is24Hour)
  const minutesRef = useLatest(minutes)
  const { mode } = useContext(DisplayModeContext)
  const modeRef = useLatest(mode)
  const onChangeRef = useLatest(onChange)
  const onPointerMove = useCallback(
    (e: GestureResponderEvent, final: boolean) => {
      if (disabledRef.current) return
      let x = e.nativeEvent.locationX
      let y = e.nativeEvent.locationY
      let angle = getAngle(x, y, circleSize)
      if (focusedRef.current === clockTypes.hours) {
        let hours24 = is24HourRef.current
        let hours12AndPm = !hours24 && modeRef.current === 'PM'
        let hourTypeFromOffset = getHourTypeFromOffset(x, y, circleSize)
        let hours24AndPM = hours24 && hourTypeFromOffset === hourTypes.pm
        let previousHourType = getHourType(hoursRef.current)
        let pickedHours = getHours(angle, previousHourType)

        if (hours12AndPm || hours24AndPM) {
          pickedHours += 12
        }
        if ((modeRef.current === 'AM' || hours24) && pickedHours === 12) {
          pickedHours = 0
        }

        if (pickedHours === 24) {
          pickedHours = 12
        }

        if (hoursRef.current !== pickedHours || final) {
          onChangeRef.current({
            focused: final ? clockTypes.minutes : undefined,
            hours: pickedHours,
            minutes: minutesRef.current,
          })
        }
      } else if (focusedRef.current === clockTypes.minutes) {
        let pickedMinutes = getMinutes(angle)
        if (minutesRef.current !== pickedMinutes) {
          onChangeRef.current({
            hours: hoursRef.current,
            minutes: pickedMinutes,
          })
        }
      }
    },
    [
      disabledRef,
      focusedRef,
      is24HourRef,
      hoursRef,
      onChangeRef,
      minutesRef,
      modeRef,
    ]
  )
  // The responder is created once and closes over the latest clock values.
  /* eslint-disable react-hooks/refs */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponderCapture: () => !disabledRef.current,
      onPanResponderGrant: (e) => onPointerMove(e, false),
      onPanResponderMove: (e) => onPointerMove(e, false),
      onPanResponderRelease: (e) => onPointerMove(e, true),
      onPanResponderTerminationRequest: returnTrue,
      onShouldBlockNativeResponder: returnTrue,
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onStartShouldSetPanResponderCapture: () => false,
    })
  ).current
  /* eslint-enable react-hooks/refs */
  const pointerNumber = focused === clockTypes.hours ? hours : minutes
  const shortPointer = hours >= 12 && is24Hour
  const dynamicSize = focused === clockTypes.hours && shortPointer ? 33 : 0
  const theme = useTheme()
  const selectorColor = disabled
    ? withAlpha(theme.colors.primary, disabledContentOpacity)
    : theme.colors.primary
  const [clockFocused, setClockFocused] = useState(false)
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  const selectionAt = (x: number, y: number) => {
    const angle = getAngle(x, y, circleSize)
    if (focusedRef.current === clockTypes.hours) {
      const hours24 = is24HourRef.current
      const hours12AndPm = !hours24 && modeRef.current === 'PM'
      const hourTypeFromOffset = getHourTypeFromOffset(x, y, circleSize)
      const hours24AndPM = hours24 && hourTypeFromOffset === hourTypes.pm
      let pickedHours = getHours(angle, getHourType(hoursRef.current))
      if (hours12AndPm || hours24AndPM) pickedHours += 12
      if ((modeRef.current === 'AM' || hours24) && pickedHours === 12) {
        pickedHours = 0
      }
      if (pickedHours === 24) pickedHours = 12
      return pickedHours
    }
    return getMinutes(angle)
  }
  const handleHoverStyle = [
    styles.handleHover,
    { backgroundColor: withAlpha('#ffffff', 0.08) },
  ]

  return (
    <View
      ref={clockRef}
      // eslint-disable-next-line react-hooks/refs -- panHandlers close over the latest clock values
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
      onBlur={() => setClockFocused(false)}
      onFocus={() => {
        if (!disabled) setClockFocused(true)
      }}
      onMouseLeave={() => setHoveredValue(null)}
      onPointerMove={(event) => {
        if (disabled) return
        setHoveredValue(
          selectionAt(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
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
            <View pointerEvents="none" style={handleHoverStyle} />
          ) : null}
          <FocusRing focused={clockFocused && !disabled} radius={24} />
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
            onPress={(nextHours) => {
              if (disabled) return
              onChange({
                focused: clockTypes.minutes,
                hours: nextHours,
                minutes,
              })
            }}
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
            onPress={(nextMinutes) => {
              if (disabled) return
              onChange({
                hours,
                minutes: nextMinutes,
              })
            }}
          />
        }
      />
    </View>
  )
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
  handleHover: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
  },
  endPoint: {
    borderRadius: 24,
    bottom: -23,
    height: 48,
    position: 'absolute',
    right: 0,
    width: 48,
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
