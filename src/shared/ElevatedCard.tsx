import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { Surface, type SurfaceProps, useTheme } from 'react-native-paper'

// md.comp.date-picker.modal / md.comp.date-input.modal container:
// surface-container-high, elevation level3, corner.extra-large (28dp).
export const dialogCardRadius = 28

// Paper's Surface can't clip its children without clipping its own shadow,
// so the content is clipped by an inner view on the same radius.
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
