import { useMemo, useRef } from 'react'
import { useWindowDimensions } from 'react-native'
import { useTheme } from 'react-native-paper'
import type { Theme } from 'react-native-paper'
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

export type PaperTheme = Theme

export function themeColor(color: unknown) {
  return typeof color === 'string' ? color : '#000000'
}

export function scrimColor(color: unknown) {
  return Color(themeColor(color)).alpha(0.32).rgb().string()
}

export function useLatest<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}

export function useIsLargeScreen() {
  const { width, height } = useWindowDimensions()
  return width > 650 && height > 650
}

export function useHeaderBackgroundColor() {
  const theme = useTheme()
  return theme.colors.elevation.level3
}

export function useHeaderTextColor() {
  const theme = useTheme()
  return themeColor(theme.colors.onSurfaceVariant)
}

export function useTextColorOnPrimary() {
  const theme = useTheme()
  const primary = themeColor(theme.colors.primary)
  const onSurface = themeColor(theme.colors.onSurface)
  const onPrimary = themeColor(theme.colors.onPrimary)
  const isThemeDark = theme.dark

  return useMemo(() => {
    const isDark = !Color(primary).isLight()
    if (isDark && isThemeDark) {
      return onSurface
    }
    return onPrimary
  }, [isThemeDark, onPrimary, onSurface, primary])
}

export function range(start: number, end: number) {
  return Array(end - start + 1)
    .fill(null)
    .map((_, i) => start + i)
}

export function lightenBy(color: InstanceType<typeof Color>, ratio: number) {
  const lightness = color.lightness()
  return color.lightness(lightness + (100 - lightness) * ratio)
}

export function darkenBy(color: InstanceType<typeof Color>, ratio: number) {
  const lightness = color.lightness()
  return color.lightness(lightness - lightness * ratio)
}
