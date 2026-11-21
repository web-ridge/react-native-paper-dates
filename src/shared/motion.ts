import { useTheme } from 'react-native-paper'

// PaperProvider sets `theme.animation.scale` to 0 when the user turns on
// Reduce Motion (its `reduceMotion` prop, "auto" by default, follows the OS
// setting). Reading the theme keeps the pickers in step with Paper's own
// components and with an app that overrides the setting.
export function useMotionScale() {
  const scale = useTheme().animation?.scale
  return typeof scale === 'number' && scale >= 0 ? scale : 1
}

export function useReduceMotion() {
  return useMotionScale() === 0
}

// Reduce Motion swaps the default slide for a fade. A fade is not motion, and
// an explicit `animationType` is left alone.
export function useModalAnimation(
  animationType: 'slide' | 'fade' | 'none' | undefined,
  fallback: 'slide' | 'fade' | 'none'
) {
  const reduceMotion = useReduceMotion()
  if (animationType) return animationType
  return reduceMotion && fallback === 'slide' ? 'fade' : fallback
}
