import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'

import CrossFade from '../shared/CrossFade'
import { sharedStyles } from '../shared/styles'

export default function AnimatedCrossView({
  calendar,
  calendarEdit,
  collapsed,
  fill = true,
}: {
  calendar: ReactNode
  calendarEdit: ReactNode
  collapsed: boolean
  fill?: boolean
}) {
  const frame = fill ? sharedStyles.root : sharedStyles.hug
  const theme = useTheme()

  return (
    <CrossFade
      collapsed={collapsed}
      containerStyle={[frame, sharedStyles.minHeightZero]}
      primary={{
        node: calendar,
        scaleX: [0.95, 1],
        scaleY: [0.85, 1],
        style: [sharedStyles.minHeightZero, frame],
      }}
      secondary={{
        node: calendarEdit,
        scale: [1, 0.95],
        style: [
          styles.calendarEdit,
          { backgroundColor: theme.colors.elevation.level3 },
        ],
      }}
    />
  )
}

const styles = StyleSheet.create({
  calendarEdit: {
    left: 0,
    position: 'absolute',
    right: 0,
  },
})
