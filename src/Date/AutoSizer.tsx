import { useCallback, useState } from 'react'
import { LayoutChangeEvent, View } from 'react-native'
import { sharedStyles } from '../shared/styles'

type WidthAndHeight = {
  width: number
  height: number
}

export default function AutoSizer({
  children,
}: {
  children: ({ width, height }: WidthAndHeight) => any
}) {
  const [layout, setLayout] = useState<WidthAndHeight | null>(null)

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nl = event.nativeEvent.layout
      // https://github.com/necolas/react-native-web/issues/1704
      if (!layout || layout.width !== nl.width || layout.height !== nl.height) {
        setLayout({ width: nl.width, height: nl.height })
      }
    },
    [layout, setLayout]
  )

  const isLayoutInitialized = layout && layout.height > 0 && layout.width > 0

  return (
    <View
      onLayout={onLayout}
      style={[
        sharedStyles.overflowHidden,
        sharedStyles.root,
        isLayoutInitialized && layout,
      ]}
    >
      {isLayoutInitialized ? children(layout) : null}
    </View>
  )
}
