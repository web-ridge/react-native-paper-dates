import * as React from 'react'
import { overlay, useTheme } from 'react-native-paper'
import Color from 'color'

export function useLatest<T>(value: T) {
  const valueRef = React.useRef<T>(value)
  React.useEffect(() => {
    valueRef.current = value
  }, [value])
  return valueRef
}

export function useHeaderBackgroundColor() {
  const theme = useTheme()
  return theme.dark && theme.mode === 'adaptive'
    ? overlay(4, theme.colors.surface)
    : theme.colors.primary
}

export function useHeaderColorIsLight() {
  const theme = useTheme()
  const background =
    theme.dark && theme.mode === 'adaptive'
      ? theme.colors.surface
      : theme.colors.primary
  return Color(background).isLight()
}

export function useHeaderTextColor() {
  const isLight = useHeaderColorIsLight()
  return !isLight ? '#fff' : '#000'
}

export function useTextColorOnPrimary() {
  const theme = useTheme()
  const isDark = !Color(theme.colors.primary).isLight()
  return isDark ? '#fff' : '#000'
}

export function range(start: number, end: number) {
  return Array(end - start + 1)
    .fill(null)
    .map((_, i) => start + i)
}
