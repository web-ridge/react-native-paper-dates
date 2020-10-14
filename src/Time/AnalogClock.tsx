import Color from 'color'
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native'
import { useTheme } from 'react-native-paper'
import {
  clockTypes,
  getAngle,
  getHours,
  getHourType,
  getHourTypeFromOffset,
  getMinutes,
  hourTypes,
  PossibleClockTypes,
} from './timeUtils'
import * as React from 'react'
import { useCallback } from 'react'
import { useLatest } from '../utils'
import AnalogClockHours from './AnalogClockHours'

import AnimatedClockSwitcher from './AnimatedClockSwitcher'
import AnalogClockMinutes from './AnalogClockMinutes'

// 250? when bigger?
export const circleSize = 215

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
  onChange: ({
    hours,
    minutes,
    focused,
  }: {
    hours: number
    minutes: number
    focused?: undefined | PossibleClockTypes
  }) => any
}) {
  const theme = useTheme()

  // used to make pointer shorter if hours are selected and above 12
  const shortPointer = hours > 12 && is24Hour

  const clockRef = React.useRef<View | null>(null)
  const elementX = React.useRef<number>(0)
  const elementY = React.useRef<number>(0)

  // Hooks are nice, sometimes... :-)..
  // We need the latest values, since the onPointerMove uses a closure to the function
  const hoursRef = useLatest(hours)
  const onChangeRef = useLatest(onChange)
  const minutesRef = useLatest(minutes)
  const focusedRef = useLatest(focused)
  const is24HourRef = useLatest(is24Hour)

  const onPointerMove = React.useCallback(
    (e: GestureResponderEvent, final: boolean) => {
      let x = e.nativeEvent.pageX - elementX.current
      let y = e.nativeEvent.pageY - elementY.current

      let angle = getAngle(x, y, circleSize)
      if (focusedRef.current === clockTypes.hours) {
        let previousHourType = getHourType(hoursRef.current)
        let pickedHours = getHours(angle, previousHourType)

        // TODO: check which mode is switched on am/pm
        if (
          (is24HourRef.current &&
            getHourTypeFromOffset(x, y, circleSize) === hourTypes.pm) ||
          (!is24HourRef.current && previousHourType === hourTypes.pm)
        ) {
          pickedHours += 12
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
    [focusedRef, is24HourRef, hoursRef, onChangeRef, minutesRef]
  )

  const panResponder = React.useRef(
    PanResponder.create({
      onPanResponderGrant: (e) => onPointerMove(e, false),
      onPanResponderMove: (e) => onPointerMove(e, false),
      onPanResponderRelease: (e) => onPointerMove(e, true),

      onStartShouldSetPanResponder: returnTrue,
      onStartShouldSetPanResponderCapture: returnTrue,
      onMoveShouldSetPanResponder: returnTrue,
      onMoveShouldSetPanResponderCapture: returnTrue,
      onPanResponderTerminationRequest: returnTrue,
      onShouldBlockNativeResponder: returnTrue,
    })
  ).current

  const onLayout = useCallback(
    (_: LayoutChangeEvent) => {
      console.log('onLayout')
      if (!clockRef.current) {
        return
      }
      clockRef.current.measureInWindow((x, y) => {
        elementX.current = x
        elementY.current = y
      })
    },
    [elementX, elementY]
  )

  const dynamicSize = focused === clockTypes.hours && shortPointer ? 33 : 0
  const pointerNumber = focused === clockTypes.hours ? hours : minutes
  const degreesPerNumber = focused === clockTypes.hours ? 30 : 6
  return (
    <View
      ref={clockRef}
      onLayout={onLayout}
      {...panResponder.panHandlers}
      style={[
        styles.clock,
        {
          backgroundColor: theme.dark
            ? Color(theme.colors.surface).lighten(1.2).hex()
            : Color(theme.colors.surface).darken(0.1).hex(),
        },
      ]}
      //@ts-ignore -> https://github.com/necolas/react-native-web/issues/506
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
                translateX: circleSize / 4 - 4 - dynamicSize / 2,
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
  clock: {
    height: circleSize,
    width: circleSize,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: circleSize / 2,
  },
  middlePoint: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  center: { justifyContent: 'center', alignItems: 'center' },
  endPoint: {
    borderRadius: 15,
    height: 30,
    width: 30,
    position: 'absolute',
    right: 0,
    bottom: -14,
  },
  line: {
    position: 'absolute',

    marginBottom: -1,
    height: 2,
    borderRadius: 4,
  },
})

function returnTrue() {
  return true
}

export default React.memo(AnalogClock)
