import { type ReactNode, useCallback, useState } from 'react'
import { LayoutChangeEvent, useWindowDimensions, View } from 'react-native'

import { sharedStyles } from '../shared/styles'
import { rememberLayout } from '../shared/utils'

type MeasuredLayout = WidthAndHeight & {
  windowKey: string
}
type WidthAndHeight = {
  height: number
  width: number
}

export default function AutoSizer({
  children,
  initialLayout,
}: {
  children: ({ height, width }: WidthAndHeight) => ReactNode
  initialLayout?: WidthAndHeight
}) {
  const [measured, setMeasured] = useState<MeasuredLayout | null>(null)
  const { height: windowHeight, width: windowWidth } = useWindowDimensions()

  const windowKey = `${windowWidth}x${windowHeight}`

  const layout =
    measured &&
    measured.windowKey === windowKey &&
    measured.width > 0 &&
    measured.height > 0
      ? measured
      : (initialLayout ?? null)

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nl = event.nativeEvent.layout
      setMeasured((prev) =>
        rememberLayout(prev, {
          height: nl.height,
          width: nl.width,
          windowKey,
        })
      )
    },
    [windowKey]
  )

  return (
    <View
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
