import { useCallback, useState } from 'react'
import { LayoutChangeEvent, useWindowDimensions, View } from 'react-native'
import { sharedStyles } from '../shared/styles'

type WidthAndHeight = {
  width: number
  height: number
}

type MeasuredLayout = WidthAndHeight & {
  windowKey: string
}

export default function AutoSizer({
  children,
}: {
  children: ({ width, height }: WidthAndHeight) => any
}) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const windowKey = `${windowWidth}x${windowHeight}`
  const [measured, setMeasured] = useState<MeasuredLayout | null>(null)

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nl = event.nativeEvent.layout
      // https://github.com/necolas/react-native-web/issues/1704
      setMeasured((prev) => {
        if (
          prev &&
          prev.windowKey === windowKey &&
          prev.width === nl.width &&
          prev.height === nl.height
        ) {
          return prev
        }
        return { windowKey, width: nl.width, height: nl.height }
      })
    },
    [windowKey]
  )

  const layout =
    measured &&
    measured.windowKey === windowKey &&
    measured.width > 0 &&
    measured.height > 0
      ? measured
      : null

  return (
    <View
      // Modals often skip onLayout during rotation. Keying by window size
      // mounts a fresh sizer so the calendar gets the landscape viewport.
      key={windowKey}
      collapsable={false}
      onLayout={onLayout}
      style={[
        sharedStyles.overflowHidden,
        sharedStyles.root,
        sharedStyles.minHeightZero,
      ]}
    >
      {layout ? children(layout) : null}
    </View>
  )
}
