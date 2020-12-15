import * as React from 'react'
import { useTheme } from 'react-native-paper'
import Color from 'color'

export function useLatest<T>(value: T) {
  const valueRef = React.useRef<T>(value)
  React.useEffect(() => {
    valueRef.current = value
  }, [value])
  return valueRef
}

export function useColorOnPrimaryBackground(background?: any) {
  const theme = useTheme()
  const isDark = !Color(background || theme.colors.primary).isLight()
  return isDark ? '#fff' : '#000'
}

// Hook
// export function usePrevious<T>(value: T) {
//   // The ref object is a generic container whose current property is mutable ...
//   // ... and can hold any value, similar to an instance property on a class
//   const ref = React.useRef<T>()
//
//   // Store current value in ref
//   React.useEffect(() => {
//     ref.current = value
//   }, [value]) // Only re-run if value changes
//
//   // Return previous value (happens before update in useEffect above)
//   return ref.current
// }

export function range(start: number, end: number) {
  return Array(end - start + 1)
    .fill(null)
    .map((_, i) => start + i)
}
