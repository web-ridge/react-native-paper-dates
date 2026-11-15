import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Animated, type StyleProp, View, type ViewStyle } from 'react-native'

export type CrossFadeLayer = {
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
  const progress = useRef(new Animated.Value(collapsed ? 1 : 0)).current
  const secondaryOpacity = useRef(
    progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    })
  ).current
  const primaryTransform = useLayerTransform(progress, primary)
  const secondaryTransform = useLayerTransform(progress, secondary)
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
      duration: 250,
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
  }, [collapsed, progress])

  return (
    <View style={containerStyle}>
      {showPrimary ? (
        <Animated.View
          pointerEvents={collapsed ? 'auto' : 'none'}
          style={[
            primary.style,
            { opacity: progress, transform: primaryTransform },
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
            { opacity: secondaryOpacity, transform: secondaryTransform },
          ]}
        >
          {secondary.node}
        </Animated.View>
      ) : null}
    </View>
  )
}

function useLayerTransform(progress: Animated.Value, layer: CrossFadeLayer) {
  const scale = useRef(
    layer.scale
      ? progress.interpolate({ inputRange: [0, 1], outputRange: layer.scale })
      : undefined
  ).current
  const scaleX = useRef(
    layer.scaleX
      ? progress.interpolate({
          inputRange: [0, 1],
          outputRange: layer.scaleX,
        })
      : undefined
  ).current
  const scaleY = useRef(
    layer.scaleY
      ? progress.interpolate({
          inputRange: [0, 1],
          outputRange: layer.scaleY,
        })
      : undefined
  ).current

  if (scaleX && scaleY) {
    return [{ scaleY }, { scaleX }]
  }
  if (scale) {
    return [{ scale }]
  }
  return undefined
}
