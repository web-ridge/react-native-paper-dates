import { useReduceMotion } from 'react-native-paper'

export function useModalAnimation(
  animationType: 'slide' | 'fade' | 'none' | undefined,
  fallback: 'slide' | 'fade' | 'none'
) {
  const reduceMotion = useReduceMotion()
  if (animationType) return animationType
  return reduceMotion && fallback === 'slide' ? 'fade' : fallback
}
