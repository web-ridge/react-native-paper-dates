import { useTheme } from 'react-native-paper'

// PaperProvider sets `theme.animation.scale` to 0 when Reduce Motion is on.
export function useMotionScale() {
  const scale = useTheme().animation?.scale
  return typeof scale === 'number' && scale >= 0 ? scale : 1
}

export function useReduceMotion() {
  return useMotionScale() === 0
}

// Reduce Motion swaps the default slide for a fade. An explicit
// `animationType` is left alone.
export function useModalAnimation(
  animationType: 'slide' | 'fade' | 'none' | undefined,
  fallback: 'slide' | 'fade' | 'none'
) {
  const reduceMotion = useReduceMotion()
  if (animationType) return animationType
  return reduceMotion && fallback === 'slide' ? 'fade' : fallback
}
