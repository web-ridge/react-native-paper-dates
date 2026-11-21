import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { Surface, type SurfaceProps, useTheme } from 'react-native-paper'

export const dialogCardRadius = 28

export default function ElevatedCard({
  children,
  style,
  testID,
}: {
  children: ReactNode
  style?: SurfaceProps['style']
  testID?: string
}) {
  const theme = useTheme()

  return (
    <Surface
      backgroundColor={theme.colors.surfaceContainerHigh}
      borderRadius={dialogCardRadius}
      elevation={3}
      style={style}
      testID={testID}
    >
      <View style={styles.clip}>{children}</View>
    </Surface>
  )
}

const styles = StyleSheet.create({
  clip: {
    borderRadius: dialogCardRadius,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
})
