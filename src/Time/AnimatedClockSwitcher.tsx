import { Animated, StyleSheet, View } from 'react-native'
import { clockTypes, PossibleClockTypes } from './timeUtils'
import { ReactElement, useEffect, useRef, useState } from 'react'
import AnalogClockHours from './AnalogClockHours'
import AnalogClockMinutes from './AnalogClockMinutes'

export default function AnimatedClockSwitcher({
  focused,
  hours,
  minutes,
}: {
  focused: PossibleClockTypes
  hours: ReactElement<typeof AnalogClockHours>
  minutes: ReactElement<typeof AnalogClockMinutes>
}) {
  const collapsed = focused === clockTypes.hours
  const [showHours, setShowHours] = useState(collapsed)
  const [showMinutes, setShowMinutes] = useState(!collapsed)
  const skipFirst = useRef(true)

  const animatedCollapsed = useRef<Animated.Value>(
    new Animated.Value(collapsed ? 1 : 0)
  ).current
  const hoursScale = useRef(
    animatedCollapsed.interpolate({
      inputRange: [0, 1],
      outputRange: [0.95, 1],
    })
  ).current
  const minutesOpacity = useRef(
    animatedCollapsed.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    })
  ).current
  const minutesScale = useRef(
    animatedCollapsed.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.95],
    })
  ).current

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false
      return
    }
    if (collapsed) {
      setShowHours(true)
    } else {
      setShowMinutes(true)
    }
    Animated.timing(animatedCollapsed, {
      toValue: collapsed ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return
      }
      if (collapsed) {
        setShowMinutes(false)
      } else {
        setShowHours(false)
      }
    })
  }, [animatedCollapsed, collapsed])

  return (
    <View style={StyleSheet.absoluteFill}>
      {showHours ? (
        <Animated.View
          pointerEvents={collapsed ? 'auto' : 'none'}
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: animatedCollapsed,
              transform: [{ scale: hoursScale }],
            },
          ]}
        >
          {hours}
        </Animated.View>
      ) : null}
      {showMinutes ? (
        <Animated.View
          pointerEvents={collapsed ? 'none' : 'auto'}
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: minutesOpacity,
              transform: [{ scale: minutesScale }],
            },
          ]}
        >
          {minutes}
        </Animated.View>
      ) : null}
    </View>
  )
}
