// @typescript-eslint/no-unused-vars
// WORK IN PROGRESS
// NO CLEAN CODE AT THE MOMENT

// Clean code inspiration: https://github.com/ShaneGH/analogue-time-picker/blob/master/src/utils/angle.ts
// TODO: how to handle copyright?

import * as React from 'react'
import {
  PanResponder,
  TextInput,
  View,
  StyleSheet,
  LayoutChangeEvent,
  TextInputProps,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native'
import { Text, TouchableRipple, useTheme } from 'react-native-paper'
import { useCallback, useMemo } from 'react'

import { getAngle, getHours, getNumbers, isPM } from './timeUtils'
import { useLatest } from '../utils'
import TimeInput from './TimeInput'
import Color from 'color'
const circleSize = 215

export type PossibleTypes = 'hours' | 'minutes'
type TypeMap = {
  [key: string]: PossibleTypes
}
const types: TypeMap = {
  minutes: 'minutes',
  hours: 'hours',
}

export default function TimePicker() {
  const clockRef = React.useRef<View | null>(null)
  const elementX = React.useRef<number>(0)
  const elementY = React.useRef<number>(0)
  const numbers = React.useMemo(() => getNumbers(false, circleSize, 12), [])

  const theme = useTheme()
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
  // method to check whether we have 24 hours in clock or 12
  const is24Hour = React.useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    })
    const formatted = formatter.format(new Date(Date.UTC(2020, 1, 1, 23)))
    return formatted.includes('23')
  }, [])

  let date = new Date()
  const focusedColor = useMemo<string>(
    () => Color(theme.colors.primary).lighten(1.02).hex(),
    [theme]
  )

  const [focused, setFocused] = React.useState<PossibleTypes>(types.hours)
  const [hours, setHours] = React.useState<number>(date.getHours())
  const [minutes, setMinutes] = React.useState<number>(date.getMinutes())

  const pointerNumber = focused === types.hours ? hours : minutes
  const onFocusInput = (type: PossibleTypes) => setFocused(type)

  // We need the latest values
  const hoursRef = useLatest(hours)
  const focusedRef = useLatest(focused)
  const is24HourRef = useLatest(is24Hour)
  const onPointerMove = React.useCallback(
    (e: GestureResponderEvent) => {
      let x = e.nativeEvent.pageX - elementX.current
      let y = e.nativeEvent.pageY - elementY.current

      let angle = getAngle(x, y, circleSize)
      if (focusedRef.current === types.hours) {
        let pickedHours = getHours(angle)

        if (is24HourRef.current && isPM(x, y, circleSize)) {
          pickedHours += 12
        }
        if (hoursRef.current !== pickedHours) {
          setHours(pickedHours)
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

  return (
    <View style={{ padding: 24 }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 35 }}
      >
        <TimeInput
          placeholder={'11'}
          value={hours}
          type={types.hours}
          focused={focused === types.hours}
          onFocus={onFocusInput}
          focusedColor={focusedColor}
        />
        <Text
          selectable={false}
          style={{ fontSize: 40, marginLeft: 6, marginRight: 6 }}
        >
          :
        </Text>
        <TimeInput
          placeholder={'10'}
          value={minutes}
          type={types.minutes}
          focused={focused === types.minutes}
          onFocus={onFocusInput}
          focusedColor={focusedColor}
        />
        <View style={{ width: 12 }} />
        <View
          style={{
            width: 41,
            height: 65,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: theme.roundness,
          }}
        >
          <TouchableRipple
            onPress={() => {}}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text selectable={false} style={{ ...theme.fonts.medium }}>
              AM
            </Text>
          </TouchableRipple>
          <View style={{ height: 1, width: 41, backgroundColor: '#ccc' }} />
          <TouchableRipple
            onPress={() => {}}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text selectable={false} style={{ ...theme.fonts.medium }}>
              PM
            </Text>
          </TouchableRipple>
        </View>
      </View>
      <View
        ref={clockRef}
        onLayout={onLayout}
        {...panResponder.panHandlers}
        style={{
          borderRadius: circleSize / 2,
          backgroundColor: '#EFEFEF',
          height: circleSize,
          width: circleSize,
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          //@ts-ignore
          cursor: 'pointer', // TODO web only
        }}
      >
        {numbers.map((a, i) => (
          <View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 20,
              width: 50,
              height: 50,
              marginLeft: -25,
              marginTop: -25,
              top: a[1],
              left: a[0],
              borderRadius: 25,
            }}
          >
            <View style={{ borderRadius: 25 }}>
              <Text
                style={hours === i + 1 ? { color: '#fff' } : {}}
                selectable={false}
              >
                {i + 1}
              </Text>
            </View>
          </View>
        ))}
        {is24Hour
          ? getNumbers(true, circleSize, 12).map((a, i) => (
              <View
                key={i}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  zIndex: 20,
                  justifyContent: 'center',
                  alignItems: 'center',

                  width: 40,
                  height: 40,
                  marginLeft: -20,
                  marginTop: -20,
                  top: a[1],
                  left: a[0],
                  borderRadius: 20,
                }}
                // onPress={() => setHours(i + 13)}
                // borderless={true}
              >
                <View style={{ borderRadius: 20 }}>
                  <Text
                    selectable={false}
                    style={[
                      { fontSize: 13 },
                      i + 13 === hours ? { color: '#fff' } : {},
                    ]}
                  >
                    {i + 13 === 24 ? '00' : i + 13}
                  </Text>
                </View>
              </View>
            ))
          : null}

        <View
          style={{
            position: 'absolute',
            width: circleSize / 2 - 4 - (hours > 12 ? 30 : 0),
            marginBottom: -1,
            height: 2,
            borderRadius: 4,
            backgroundColor: theme.colors.primary,
            transform: [
              { rotate: -90 + pointerNumber * 30 + 'deg' },
              { translateX: circleSize / 4 - 4 - (hours > 12 ? 30 / 2 : 0) },
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
              bottom: -15,
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
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  middlePoint: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
})

function returnTrue() {
  return true
}
