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
  fill = true,
  initialLayout,
}: {
  children: ({ height, width }: WidthAndHeight) => ReactNode
  fill?: boolean
  initialLayout?: WidthAndHeight
}) {
  const [measured, setMeasured] = useState<MeasuredLayout | null>(null)
  const { height: windowHeight, width: windowWidth } = useWindowDimensions()

  const windowKey = `${windowWidth}x${windowHeight}`

  const measuredReady =
    measured &&
    measured.windowKey === windowKey &&
    measured.width > 0 &&
    (fill ? measured.height > 0 : true)
      ? measured
      : null
  const windowLayout =
    windowWidth > 0 && (!fill || windowHeight > 0)
      ? { height: windowHeight, width: windowWidth }
      : null
  const layout = measuredReady ?? initialLayout ?? windowLayout

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
        fill ? sharedStyles.root : sharedStyles.hug,
        fill ? sharedStyles.minHeightZero : null,
      ]}
    >
      {layout && (fill ? layout.height > 0 : layout.width > 0)
        ? children(layout)
        : null}
    </View>
  )
}
