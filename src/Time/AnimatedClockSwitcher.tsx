import * as React from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { clockTypes, PossibleClockTypes } from './timeUtils'

export default function AnimatedClockSwitcher({
  focused,
  hours,
  minutes,
}: {
  focused: PossibleClockTypes
  hours: any
  minutes: any
}) {
  const collapsed = focused === clockTypes.hours
  const animatedCollapsed = React.useRef<Animated.Value>(
    new Animated.Value(collapsed ? 1 : 0)
  )
  React.useEffect(() => {
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
