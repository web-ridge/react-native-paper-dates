import { useRef } from 'react'
import {
  type ColorValue,
  Platform,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native'
import { type Theme, useTheme } from 'react-native-paper'

export type PaperTheme = Theme

type Rgb = {
  a: number
  b: number
  g: number
  r: number
}

const alphaColors = new Map<string, string>()

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

function channelByte(value: number) {
  return Math.max(0, Math.min(255, Number(value.toFixed(0))))
}

export function displayCase(text: string, uppercase: boolean) {
  return uppercase ? text.toUpperCase() : text
}

export function isTextField(target: EventTarget | null) {
  if (!target || typeof target !== 'object' || !('tagName' in target)) {
    return false
  }
  const tag = String((target as { tagName?: string }).tagName)
  return tag === 'INPUT' || tag === 'TEXTAREA'
}

function parseColor(input: string): Rgb {
  const value = input.trim()
  const hex = /^#([\da-f]{3,8})$/i.exec(value)
  if (hex) {
    let body = hex[1]
    if (body.length === 3 || body.length === 4) {
      body = [...body].map((channel) => channel + channel).join('')
    }
    return {
      a: body.length >= 8 ? Number.parseInt(body.slice(6, 8), 16) / 255 : 1,
      b: Number.parseInt(body.slice(4, 6), 16),
      g: Number.parseInt(body.slice(2, 4), 16),
      r: Number.parseInt(body.slice(0, 2), 16),
    }
  }

  const rgb =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
      value
    )
  if (rgb) {
    return {
      a: rgb[4] === undefined ? 1 : Number(rgb[4]),
      b: Number(rgb[3]),
      g: Number(rgb[2]),
      r: Number(rgb[1]),
    }
  }

  return { a: 1, b: 0, g: 0, r: 0 }
}

export function range(start: number, end: number) {
  return Array(end - start + 1)
    .fill(null)
    .map((_, i) => start + i)
}

export function rememberLayout<
  T extends { height: number; width: number; windowKey: string },
>(prev: T | null, next: T) {
  return prev &&
    prev.windowKey === next.windowKey &&
    prev.width === next.width &&
    prev.height === next.height
    ? prev
    : next
}

function rgbaString({ a, b, g, r }: Rgb) {
  const alpha = Math.round(a * 1000) / 1000
  return `rgba(${channelByte(r)}, ${channelByte(g)}, ${channelByte(b)}, ${alpha})`
}

export function scrollbarThumb(color: unknown): ViewStyle | null {
  if (Platform.OS !== 'web' || typeof color !== 'string') return null
  return { scrollbarColor: `${color} transparent` } as ViewStyle
}

export function themeColor(color: unknown) {
  return typeof color === 'string' ? color : '#000000'
}

export function useHeaderBackgroundColor(): ColorValue {
  const theme = useTheme()
  return theme.colors.surfaceContainerHigh
}

export function useHeaderTextColor() {
  const theme = useTheme()
  return themeColor(theme.colors.onSurfaceVariant)
}

export function useIsLargeScreen() {
  const { height, width } = useWindowDimensions()
  return width > 650 && height > 650
}

export function useLatest<T>(value: T) {
  const ref = useRef(value)
  // eslint-disable-next-line react-hooks/refs -- This hook exists to publish the latest value. Callers read it from events.
  ref.current = value
  return ref
}

export function useTextColorOnPrimary() {
  const theme = useTheme()
  return themeColor(theme.colors.onPrimary)
}

export function withAlpha(color: unknown, alpha: number) {
  const key = typeof color === 'string' ? `${color}|${alpha}` : null
  const cached = key === null ? undefined : alphaColors.get(key)
  if (cached !== undefined) return cached
  const value = rgbaString({
    ...parseColor(themeColor(color)),
    a: Math.max(0, Math.min(1, alpha)),
  })
  if (key !== null) {
    if (alphaColors.size >= 256) alphaColors.clear()
    alphaColors.set(key, value)
  }
  return value
}
