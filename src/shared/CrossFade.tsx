import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Animated, type StyleProp, View, type ViewStyle } from 'react-native'

import { useMotionScale } from './motion'

type CrossFadeLayer = {
  node: ReactNode
  scale?: ScaleRange
  scaleX?: ScaleRange
  scaleY?: ScaleRange
  style?: StyleProp<ViewStyle>
}
type ScaleRange = [number, number]

export default function CrossFade({
  collapsed,
  containerStyle,
  primary,
  secondary,
}: {
  collapsed: boolean
  containerStyle?: StyleProp<ViewStyle>
  primary: CrossFadeLayer
  secondary: CrossFadeLayer
}) {
  const motionScale = useMotionScale()
  const [progress] = useState(() => new Animated.Value(collapsed ? 1 : 0))
  const [secondaryOpacity] = useState(() =>
    progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
  )
  const primaryTransform = useLayerTransform(progress, primary)
  const secondaryTransform = useLayerTransform(progress, secondary)
  const reduceMotion = motionScale === 0
  const [showPrimary, setShowPrimary] = useState(collapsed)
  const [showSecondary, setShowSecondary] = useState(!collapsed)
  const skipFirst = useRef(true)
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false
      return
    }
    if (collapsed) {
      setShowPrimary(true)
    } else {
      setShowSecondary(true)
    }
    Animated.timing(progress, {
      duration: 250 * motionScale,
      toValue: collapsed ? 1 : 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return
      }
      if (collapsed) {
        setShowSecondary(false)
      } else {
        setShowPrimary(false)
      }
    })
  }, [collapsed, motionScale, progress])

  return (
    <View style={containerStyle}>
      {showPrimary ? (
        <Animated.View
          pointerEvents={collapsed ? 'auto' : 'none'}
          style={[
            primary.style,
            {
              opacity: progress,
              transform: reduceMotion ? undefined : primaryTransform,
            },
          ]}
        >
          {primary.node}
        </Animated.View>
      ) : null}
      {showSecondary ? (
        <Animated.View
          pointerEvents={collapsed ? 'none' : 'auto'}
          style={[
            secondary.style,
            {
              opacity: secondaryOpacity,
              transform: reduceMotion ? undefined : secondaryTransform,
            },
          ]}
        >
          {secondary.node}
        </Animated.View>
      ) : null}
    </View>
  )
}

function useLayerTransform(progress: Animated.Value, layer: CrossFadeLayer) {
  const [transform] = useState(() => {
    const range = (outputRange: ScaleRange) =>
      progress.interpolate({ inputRange: [0, 1], outputRange })
    if (layer.scaleX && layer.scaleY) {
      return [{ scaleY: range(layer.scaleY) }, { scaleX: range(layer.scaleX) }]
    }
    if (layer.scale) return [{ scale: range(layer.scale) }]
    return undefined
  })
  return transform
}
