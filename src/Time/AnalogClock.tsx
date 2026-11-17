import { memo, useCallback, useContext, useRef } from 'react'
import {
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  View,
  type ViewInstance,
} from 'react-native'
import { useTheme } from 'react-native-paper'

import { DisplayModeContext } from '../contexts/DisplayModeContext'
import { useLatest } from '../shared/utils'
import AnalogClockHours from './AnalogClockHours'
import AnalogClockMinutes from './AnalogClockMinutes'
import AnimatedClockSwitcher from './AnimatedClockSwitcher'
import {
  circleSize,
  clockTypes,
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
  focused,
  hours,
  is24Hour,
  locale,
  minutes,
  onChange,
}: {
  focused: PossibleClockTypes
  hours: number
  is24Hour: boolean
  locale?: string
  minutes: number
  onChange: TimeChange
}) {
  const clockRef = useRef<ViewInstance | null>(null)
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
    [focusedRef, is24HourRef, hoursRef, onChangeRef, minutesRef, modeRef]
  )
  // The responder is created once and closes over the latest clock values.
  /* eslint-disable react-hooks/refs */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: returnTrue,
      onMoveShouldSetPanResponderCapture: returnTrue,
      onPanResponderGrant: (e) => onPointerMove(e, false),
      onPanResponderMove: (e) => onPointerMove(e, false),
      onPanResponderRelease: (e) => onPointerMove(e, true),
      onPanResponderTerminationRequest: returnTrue,
      onShouldBlockNativeResponder: returnTrue,
      onStartShouldSetPanResponder: returnTrue,
      onStartShouldSetPanResponderCapture: () => false,
    })
  ).current
  /* eslint-enable react-hooks/refs */
  const pointerNumber = focused === clockTypes.hours ? hours : minutes
  const shortPointer = hours >= 12 && is24Hour
  const dynamicSize = focused === clockTypes.hours && shortPointer ? 33 : 0
  const theme = useTheme()

  return (
    <View
      ref={clockRef}
      // eslint-disable-next-line react-hooks/refs -- panHandlers close over the latest clock values
      {...panResponder.panHandlers}
      style={[
        styles.clock,
        {
          backgroundColor: theme.colors.surfaceContainerHighest,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.line,
          {
            backgroundColor: theme.colors.primary,
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
        <View
          style={[styles.endPoint, { backgroundColor: theme.colors.primary }]}
        />
      </View>
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.center]}
      >
        <View
          style={[
            styles.middlePoint,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </View>
      <AnimatedClockSwitcher
        focused={focused}
        hours={
          <AnalogClockHours
            hours={hours}
            is24Hour={is24Hour}
            locale={locale}
            onPress={(nextHours) => {
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
            locale={locale}
            minutes={minutes}
            onPress={(nextMinutes) => {
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
