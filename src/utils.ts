import * as React from 'react'
import { overlay } from 'react-native-paper'
import Color from 'color'

export function useLatest<T>(value: T) {
  const valueRef = React.useRef<T>(value)
  React.useEffect(() => {
    valueRef.current = value
  }, [value])
  return valueRef
}

export function useHeaderBackgroundColor(theme: ReactNativePaper.Theme) {
  return theme.dark && theme.mode === 'adaptive'
    ? overlay(4, theme.colors.surface)
    : theme.colors.primary
}

export function useHeaderColorIsLight(theme: ReactNativePaper.Theme) {
  const background =
    theme.dark && theme.mode === 'adaptive'
      ? theme.colors.surface
      : theme.colors.primary
  return Color(background).isLight()
}

export function useHeaderTextColor(theme: ReactNativePaper.Theme) {
  const isLight = useHeaderColorIsLight(theme)
  return !isLight ? '#fff' : '#000'
}

export function useTextColorOnPrimary(theme: ReactNativePaper.Theme) {
  const isDark = !Color(theme.colors.primary).isLight()
  return isDark ? '#fff' : '#000'
}

export function range(start: number, end: number) {
  return Array(end - start + 1)
    .fill(null)
    .map((_, i) => start + i)
}
