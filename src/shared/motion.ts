import { useTheme } from 'react-native-paper'

export function useMotionScale() {
  const scale = useTheme().animation?.scale
  return typeof scale === 'number' && scale >= 0 ? scale : 1
}

function useReduceMotion() {
  return useMotionScale() === 0
}

export function useModalAnimation(
  animationType: 'slide' | 'fade' | 'none' | undefined,
  fallback: 'slide' | 'fade' | 'none'
) {
  const reduceMotion = useReduceMotion()
  if (animationType) return animationType
  return reduceMotion && fallback === 'slide' ? 'fade' : fallback
}
