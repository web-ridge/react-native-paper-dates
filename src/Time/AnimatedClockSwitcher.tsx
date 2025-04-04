import { Animated, StyleSheet, View } from 'react-native'
import { clockTypes, PossibleClockTypes } from './timeUtils'
import { ReactElement, useEffect, useRef } from 'react'
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

  const animatedCollapsed = useRef<Animated.Value>(
    new Animated.Value(collapsed ? 1 : 0)
  )

  useEffect(() => {
    Animated.timing(animatedCollapsed.current, {
      toValue: collapsed ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start()
  }, [collapsed])

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        pointerEvents={collapsed ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: animatedCollapsed.current,
            transform: [
              {
                scale: animatedCollapsed.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
        ]}
      >
        {hours}
      </Animated.View>
      <Animated.View
        pointerEvents={collapsed ? 'none' : 'auto'}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: animatedCollapsed.current.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
            transform: [
              {
                scale: animatedCollapsed.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.95],
                }),
              },
            ],
          },
        ]}
      >
        {minutes}
      </Animated.View>
    </View>
  )
}
