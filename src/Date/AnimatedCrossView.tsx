import * as React from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

export default function AnimatedCrossView({
  // visible,
  collapsed,
  calendar,
  calendarEdit,
}: {
  calendar: any
  calendarEdit: any
  // visible: boolean
  collapsed: boolean
}) {
  const theme = useTheme()
  const calendarOpacity = React.useRef<Animated.Value>(
    new Animated.Value(collapsed ? 1 : 0)
  )
  React.useEffect(() => {
    // if (visible) {
    Animated.timing(calendarOpacity.current, {
      toValue: collapsed ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start()
    // }
  }, [collapsed])

  return (
    <View style={styles.root}>
      <Animated.View
        pointerEvents={collapsed ? 'auto' : 'none'}
        style={[
          styles.calendar,
          {
            opacity: calendarOpacity.current,
            transform: [
              {
                scaleY: calendarOpacity.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1],
                }),
              },
              {
                scaleX: calendarOpacity.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
        ]}
      >
        {calendar}
      </Animated.View>
      <Animated.View
        pointerEvents={collapsed ? 'none' : 'auto'}
        style={[
          styles.calendarEdit,
          {
            backgroundColor: theme.colors.surface,
            opacity: calendarOpacity.current.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
            transform: [
              {
                scale: calendarOpacity.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.95],
                }),
              },
            ],
          },
        ]}
      >
        {calendarEdit}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  calendarEdit: {
    position: 'absolute',

    left: 0,
    right: 0,
  },
  calendar: {
    flex: 1,
  },
})
