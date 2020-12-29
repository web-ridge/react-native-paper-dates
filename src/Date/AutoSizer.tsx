import * as React from 'react'
import { StyleSheet, View } from 'react-native'

type WidthAndHeight = {
  width: number
  height: number
}

export default function AutoSizer({
  children,
}: {
  children: ({ width, height }: WidthAndHeight) => any
}) {
  const [layout, setLayout] = React.useState<WidthAndHeight | null>(null)
  const onLayout = React.useCallback(
    (event: any) => {
      console.log('onLayout')
      const nl = event.nativeEvent.layout

      // https://github.com/necolas/react-native-web/issues/1704
      if (!layout || layout.width !== nl.width || layout.height !== nl.height) {
        setLayout({ width: nl.width, height: nl.height })
      }
    },
    [layout, setLayout]
  )
  return (
    <View style={styles.autoSizer} onLayout={onLayout}>
      {layout ? children(layout) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  autoSizer: {
    flex: 1,
    overflow: 'hidden',
  },
})
