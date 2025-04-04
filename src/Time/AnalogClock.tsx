import Color from 'color'
import {
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native'
import { useTheme } from 'react-native-paper'
import {
  circleSize,
  clockTypes,
  getAngle,
  getHours,
  getHourType,
  getHourTypeFromOffset,
  getMinutes,
  hourTypes,
  PossibleClockTypes,
} from './timeUtils'
import { useLatest } from '../shared/utils'
import AnalogClockHours from './AnalogClockHours'
import AnimatedClockSwitcher from './AnimatedClockSwitcher'
import AnalogClockMinutes from './AnalogClockMinutes'
import { DisplayModeContext } from '../contexts/DisplayModeContext'
import { memo, useCallback, useContext, useRef } from 'react'

function returnTrue() {
  return true
}

function AnalogClock({
  hours,
  minutes,
  focused,
  is24Hour,
  onChange,
}: {
  hours: number
  minutes: number
  focused: PossibleClockTypes
  is24Hour: boolean
  onChange: (hoursMinutesAndFocused: {
    hours: number
    minutes: number
    focused?: undefined | PossibleClockTypes
  }) => any
}) {
  const shortPointer = hours >= 12 && is24Hour

  const theme = useTheme()

  const { mode } = useContext(DisplayModeContext)

  // used to make pointer shorter if hours are selected and above 12
  const clockRef = useRef<View | null>(null)

  // Hooks are nice, sometimes... :-)..
  // We need the latest values, since the onPointerMove uses a closure to the function
  const hoursRef = useLatest(hours)
  const onChangeRef = useLatest(onChange)
  const minutesRef = useLatest(minutes)
  const focusedRef = useLatest(focused)
  const is24HourRef = useLatest(is24Hour)
  const modeRef = useLatest(mode)

  const onPointerMove = useCallback(
    (e: GestureResponderEvent, final: boolean) => {
      let x = e.nativeEvent.locationX
      let y = e.nativeEvent.locationY
      let angle = getAngle(x, y, circleSize)
      if (focusedRef.current === clockTypes.hours) {
        let hours24 = is24HourRef.current
        let previousHourType = getHourType(hoursRef.current)
        let pickedHours = getHours(angle, previousHourType)

        let hours12AndPm = !hours24 && modeRef.current === 'PM'

        let hourTypeFromOffset = getHourTypeFromOffset(x, y, circleSize)
        let hours24AndPM = hours24 && hourTypeFromOffset === hourTypes.pm

        // Avoiding the "24h"
        // Should be 12h for 12 hours and PM mode

        if (hours12AndPm || hours24AndPM) {
          pickedHours += 12
        }
        if ((modeRef.current === 'AM' || hours24) && pickedHours === 12) {
          pickedHours = 0
        }

        if (!hours24 && modeRef.current === 'AM' && pickedHours === 12) {
          pickedHours = 0
        }

        if (pickedHours === 24) {
          pickedHours = 12
        }

        if (hoursRef.current !== pickedHours || final) {
          onChangeRef.current({
            hours: pickedHours,
            minutes: minutesRef.current,
            focused: final ? clockTypes.minutes : undefined,
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
  const panResponder = useRef(
    PanResponder.create({
      onPanResponderGrant: (e) => onPointerMove(e, false),
      onPanResponderMove: (e) => onPointerMove(e, false),
      onPanResponderRelease: (e) => onPointerMove(e, true),
      onStartShouldSetPanResponder: returnTrue,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: returnTrue,
      onMoveShouldSetPanResponderCapture: returnTrue,
      onPanResponderTerminationRequest: returnTrue,
      onShouldBlockNativeResponder: returnTrue,
    })
  ).current

  const dynamicSize = focused === clockTypes.hours && shortPointer ? 33 : 0
  const pointerNumber = focused === clockTypes.hours ? hours : minutes
  const degreesPerNumber = focused === clockTypes.hours ? 30 : 6

  const v3Color = theme.colors.surfaceVariant
  const v2Color = theme.dark
    ? Color(theme.colors.surface).lighten(1.4).hex()
    : Color(theme.colors.surface).darken(0.1).hex()
  return (
    <View
      ref={clockRef}
      {...panResponder.panHandlers}
      style={[
        styles.clock,
        {
          backgroundColor: theme.isV3 ? v3Color : v2Color,
        },
      ]}
      // @ts-ignore -> https://github.com/necolas/react-native-web/issues/506
      cursor={'pointer'}
    >
      <View
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
        pointerEvents="none"
      >
        <View
          style={[styles.endPoint, { backgroundColor: theme.colors.primary }]}
        />
      </View>
      <View
        style={[StyleSheet.absoluteFill, styles.center]}
        pointerEvents="none"
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
        hours={<AnalogClockHours is24Hour={is24Hour} hours={hours} />}
        minutes={<AnalogClockMinutes minutes={minutes} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clock: {
    alignItems: 'center',
    borderRadius: circleSize / 2,
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
