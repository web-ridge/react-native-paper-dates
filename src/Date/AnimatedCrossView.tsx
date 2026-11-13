import { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { sharedStyles } from '../shared/styles'

export default function AnimatedCrossView({
  calendar,
  calendarEdit,
  collapsed,
}: {
  calendar: any
  calendarEdit: any
  collapsed: boolean
}) {
  const theme = useTheme()
  const [showCalendar, setShowCalendar] = useState(collapsed)
  const [showEdit, setShowEdit] = useState(!collapsed)
  const skipFirst = useRef(true)

  const calendarOpacity = useRef<Animated.Value>(
    new Animated.Value(collapsed ? 1 : 0)
  ).current
  const calendarScaleY = useRef(
    calendarOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0.85, 1],
    })
  ).current
  const calendarScaleX = useRef(
    calendarOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0.95, 1],
    })
  ).current
  const editOpacity = useRef(
    calendarOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    })
  ).current
  const editScale = useRef(
    calendarOpacity.interpolate({
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
      setShowCalendar(true)
    } else {
      setShowEdit(true)
    }
    Animated.timing(calendarOpacity, {
      toValue: collapsed ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return
      }
      if (collapsed) {
        setShowEdit(false)
      } else {
        setShowCalendar(false)
      }
    })
  }, [calendarOpacity, collapsed])

  return (
    <View style={[sharedStyles.root, sharedStyles.minHeightZero]}>
      {showCalendar ? (
        <Animated.View
          pointerEvents={collapsed ? 'auto' : 'none'}
          style={[
            sharedStyles.minHeightZero,
            sharedStyles.root,
            {
              opacity: calendarOpacity,
              transform: [
                { scaleY: calendarScaleY },
                { scaleX: calendarScaleX },
              ],
            },
          ]}
        >
          {calendar}
        </Animated.View>
      ) : null}
      {showEdit ? (
        <Animated.View
          pointerEvents={collapsed ? 'none' : 'auto'}
          style={[
            styles.calendarEdit,
            {
              backgroundColor: theme.colors.elevation.level3,
              opacity: editOpacity,
              transform: [{ scale: editScale }],
            },
          ]}
        >
          {calendarEdit}
        </Animated.View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  calendarEdit: {
    left: 0,
    position: 'absolute',
    right: 0,
  },
})
