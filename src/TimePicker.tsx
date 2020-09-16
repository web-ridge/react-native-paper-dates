// @typescript-eslint/no-unused-vars
// WORK IN PROGRESS
// NO CLEAN CODE AT THE MOMENT

// Clean code inspiration: https://github.com/ShaneGH/analogue-time-picker/blob/master/src/utils/angle.ts
// TODO: how to handle copyright?

import * as React from 'react'
import { PanResponder, View, StyleSheet, LayoutChangeEvent } from 'react-native'
import { TextInput, TouchableRipple, Text, useTheme } from 'react-native-paper'
import { useCallback } from 'react'

const circleSize = 200
const howMany = 12

let outerRadius = circleSize / 2
let innerRadius = circleSize / 2 - 36

function getNumbers(is24Hour: boolean) {
  let width = circleSize
  let height = circleSize
  let angle = 0
  let step = (2 * Math.PI) / howMany
  let radius = width / (is24Hour ? 4 : 2.5)

  angle = angle = (-90 * Math.PI) / 180 + Math.PI / 6

  return Array(12)
    .fill(true)
    .map(() => {
      let x = Math.round(width / 2 + radius * Math.cos(angle))
      let y = Math.round(height / 2 + radius * Math.sin(angle))
      angle += step
      return [x, y]
    })
}

export default function TimePicker() {
  const clockRef = React.useRef<View | null>(null)
  const elementX = React.useRef<number>(0)
  const elementY = React.useRef<number>(0)
  const numbers = React.useMemo(() => getNumbers(false), [])

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

  const [focused, setFocused] = React.useState<'hours' | 'minutes'>('hours')
  const [hours, setHours] = React.useState<number>(date.getHours())
  const [minutes, setMinutes] = React.useState<number>(date.getMinutes() / 5)

  const pointerNumber = focused === 'hours' ? hours : minutes
  const panResponder = React.useRef(
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (e, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}

        let x = e.nativeEvent.pageX - elementX.current
        let y = e.nativeEvent.pageY - elementY.current

        let angle = getAngle(x, y, circleSize)
        let pickedHours = getHours(angle)
        console.log({ x, y, angle, pickedHours })

        if (pickedHours !== hours) {
          setHours(pickedHours)
        }
      },

      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        console.log('CANCEL THIS!!!!')
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true
      },
    })
  ).current
  return (
    <View style={{ padding: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput placeholder={'11'} mode={'outlined'} />
        <Text style={{ fontSize: 40, marginLeft: 6, marginRight: 6 }}>:</Text>
        <TextInput placeholder={'10'} mode={'outlined'} />
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
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pointerEvents={'none'}
        >
          <View
            style={{
              width: outerRadius * 2,
              height: outerRadius * 2,
              backgroundColor: 'pink',
              borderRadius: outerRadius,
              opacity: 0.2,
              position: 'absolute',
            }}
          />
          <View
            pointerEvents={'none'}
            style={{
              width: innerRadius * 2,
              height: innerRadius * 2,
              backgroundColor: 'black',
              borderRadius: innerRadius,
              opacity: 0.2,
              position: 'absolute',
            }}
          />
        </View>
        {numbers.map((a, i) => (
          <View
            key={i}
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
            <View style={{ borderRadius: 25 }} pointerEvents="none">
              <Text style={hours === i + 1 ? { color: '#fff' } : {}}>
                {i + 1}
              </Text>
            </View>
          </View>
        ))}
        {is24Hour
          ? getNumbers(true).map((a, i) => (
              <View
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
                <View style={{ borderRadius: 20 }} pointerEvents="none">
                  <Text
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
        >
          <View
            style={{
              borderRadius: 20,
              height: 30,
              width: 30,
              position: 'absolute',
              backgroundColor: theme.colors.primary,
              right: 0,
              bottom: -15,
            }}
          />
          <View
            style={{
              borderRadius: 4,
              height: 8,
              width: 8,
              position: 'absolute',
              backgroundColor: theme.colors.primary,
              left: 0,
              bottom: -2,
            }}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({})

const _30 = Math.PI / 6
const _12 = Math.PI / 30
const _360 = Math.PI * 2
const _90 = Math.PI / 2

/** Snap an angle to a given step. E.g. if angle = 22° and step = 10°, round down to 20° */
function snap(angle: number, step: number) {
  let a = angle
  while (a < 0) a += _360
  let diff = a % step

  if (diff <= step / 2) {
    return angle - diff
  }

  return angle - diff + step
}

/** Calculate the hour from the hand angle */
function getHours(handAngle: number) {
  handAngle = snap(handAngle, _30)

  // TODO: parseInt?
  let hour = parseInt((((handAngle - _90) % _360) / _30).toFixed())
  if (hour < 0) hour += 12
  if (hour >= 12) hour -= 12

  // TODO:
  // if (!hour) {
  //   if (amPm === AmPm.am) hour = 12
  // } else {
  //   if (amPm !== AmPm.am) hour += 12
  // }

  return hour
}

/** Get the angle of the left/top co-ordinate from the center of the width.height box */
function getAngle(left: number, top: number, size: number) {
  const x = size / 2 - left
  const y = size / 2 - top

  // tan O = y / x
  let angle = x ? Math.atan(y / x) : y < 0 ? -_90 : _90
  if (x < 0) {
    // reflect along vertical axis
    angle = -angle + 2 * (_90 + angle)
  }

  return angle
}
