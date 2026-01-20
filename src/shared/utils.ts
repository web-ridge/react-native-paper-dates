import { useRef } from 'react'
import { DefaultTheme, MD3DarkTheme, useTheme } from 'react-native-paper'
import Color from 'color'

export const supportedOrientations: (
  | 'portrait'
  | 'portrait-upside-down'
  | 'landscape'
  | 'landscape-left'
  | 'landscape-right'
)[] = [
  'portrait',
  'portrait-upside-down',
  'landscape',
  'landscape-left',
  'landscape-right',
]

export type PaperTheme = typeof MD3DarkTheme | typeof DefaultTheme

export function useLatest<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}

export function useHeaderBackgroundColor() {
  const theme = useTheme()
  return theme.colors.surface
}

export function useHeaderTextColor() {
  const theme = useTheme()
  return theme.colors.onSurfaceVariant
}

export function useTextColorOnPrimary() {
  const theme = useTheme()
  const isDark = !Color(theme.colors.primary).isLight()

  if (isDark && theme.dark) {
    return theme.colors.onSurface
  }
  return theme.colors.onPrimary
}

export function range(start: number, end: number) {
  return Array(end - start + 1)
    .fill(null)
    .map((_, i) => start + i)
}

export function lightenBy(color: Color, ratio: number) {
  const lightness = color.lightness()
  return color.lightness(lightness + (100 - lightness) * ratio)
}

export function darkenBy(color: Color, ratio: number) {
  const lightness = color.lightness()
  return color.lightness(lightness - lightness * ratio)
}
