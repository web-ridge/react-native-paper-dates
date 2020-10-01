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
  isPM,
  PossibleClockTypes,
} from './timeUtils'
import * as React from 'react'
import { useCallback } from 'react'
import { useLatest } from '../utils'
import AnalogClockHours from './AnalogClockHours'

export const circleSize = 215

export default function AnalogClock({
  hours,
  minutes,
  focused,
  is24Hour,
}: {
  hours: number
  minutes: number
  focused: PossibleClockTypes
  is24Hour: boolean
}) {
  const theme = useTheme()
  const pointerNumber = focused === clockTypes.hours ? hours : minutes
  const clockRef = React.useRef<View | null>(null)
  const elementX = React.useRef<number>(0)
  const elementY = React.useRef<number>(0)

  // We need the latest values
  const hoursRef = useLatest(hours)
  const focusedRef = useLatest(focused)
  const is24HourRef = useLatest(is24Hour)
  const onPointerMove = React.useCallback(
    (e: GestureResponderEvent) => {
      let x = e.nativeEvent.pageX - elementX.current
      let y = e.nativeEvent.pageY - elementY.current

      let angle = getAngle(x, y, circleSize)
      if (focusedRef.current === clockTypes.hours) {
        let pickedHours = getHours(angle)

        if (is24HourRef.current && isPM(x, y, circleSize)) {
          pickedHours += 12
        }
        if (hoursRef.current !== pickedHours) {
          // TODO: add onChange
          // setHours(pickedHours)
        }
      }
    },
    [hoursRef, focusedRef, is24HourRef]
  )

  const panResponder = React.useRef(
    PanResponder.create({
      onPanResponderGrant: onPointerMove,
      onPanResponderMove: onPointerMove,
      onPanResponderRelease: onPointerMove,

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
        style={{
          position: 'absolute',
          width: circleSize / 2 - 4 - (hours > 12 ? 33 : 0),
          marginBottom: -1,
          height: 2,
          borderRadius: 4,
          backgroundColor: theme.colors.primary,
          transform: [
            { rotate: -90 + pointerNumber * 30 + 'deg' },
            { translateX: circleSize / 4 - 4 - (hours > 12 ? 33 / 2 : 0) },
          ],
        }}
        pointerEvents="none"
      >
        <View
          style={{
            borderRadius: 15,
            height: 30,
            width: 30,
            position: 'absolute',
            backgroundColor: theme.colors.primary,
            right: 0,
            bottom: -14,
          }}
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
      <AnalogClockHours is24Hour={is24Hour} hours={hours} />
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
})

function returnTrue() {
  return true
}
