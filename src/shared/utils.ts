import { useMemo, useRef } from 'react'
import { useWindowDimensions } from 'react-native'
import { type Theme, useTheme } from 'react-native-paper'

function channelByte(value: number) {
  return Math.max(0, Math.min(255, Number(value.toFixed(0))))
}

export function darkenColor(color: string, ratio: number) {
  const { b, g, r } = parseColor(color)
  const [hue, saturation, lightness] = rgbToHsl(r, g, b)
  const [red, green, blue] = hslToRgb(
    hue,
    saturation,
    lightness - lightness * ratio
  )
  return hexColor(`rgb(${red}, ${green}, ${blue})`)
}

export function displayCase(text: string, uppercase: boolean) {
  return uppercase ? text.toUpperCase() : text
}

export function fadeColor(color: string, ratio: number) {
  const parsed = parseColor(color)
  return rgbaString({ ...parsed, a: parsed.a * (1 - ratio) })
}

export function hexColor(color: string) {
  const { b, g, r } = parseColor(color)
  return `#${[r, g, b]
    .map((channel) => channelByte(channel).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`
}

function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number
): [number, number, number] {
  const h = hue / 360
  const l = lightness / 100
  const s = saturation / 100
  if (s === 0) {
    const value = l * 255
    return [value, value, value]
  }

  const rgb: [number, number, number] = [0, 0, 0]
  const t2 = l < 0.5 ? l * (1 + s) : l + s - l * s
  const t1 = 2 * l - t2
  for (let index = 0; index < 3; index += 1) {
    let t3 = h + (1 / 3) * -(index - 1)
    if (t3 < 0) t3 += 1
    if (t3 > 1) t3 -= 1
    let value = t1
    if (6 * t3 < 1) value = t1 + (t2 - t1) * 6 * t3
    else if (2 * t3 < 1) value = t2
    else if (3 * t3 < 2) value = t1 + (t2 - t1) * (2 / 3 - t3) * 6
    rgb[index] = value * 255
  }
  return rgb
}

export function isDarkColor(color: string) {
  const { b, g, r } = parseColor(color)
  const yiq = (r * 2126 + g * 7152 + b * 722) / 10000
  return yiq < 128
}

export type PaperTheme = Theme

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

type Rgb = {
  a: number
  b: number
  g: number
  r: number
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

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const blue = b / 255
  const green = g / 255
  let hue = 0
  const red = r / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  if (max !== min) {
    if (max === red) hue = (green - blue) / delta
    else if (max === green) hue = 2 + (blue - red) / delta
    else hue = 4 + (red - green) / delta
  }
  hue = Math.min(hue * 60, 360)
  if (hue < 0) hue += 360
  const lightness = (min + max) / 2
  let saturation = 0
  if (max !== min) {
    saturation =
      lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min)
  }
  return [hue, saturation * 100, lightness * 100]
}

export function scrimColor(color: unknown) {
  return rgbaString({ ...parseColor(themeColor(color)), a: 0.32 })
}

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

export function themeColor(color: unknown) {
  return typeof color === 'string' ? color : '#000000'
}

export function useHeaderBackgroundColor() {
  const theme = useTheme()
  return theme.colors.elevation.level3
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
  ref.current = value
  return ref
}

export function useTextColorOnPrimary() {
  const theme = useTheme()
  const isThemeDark = theme.dark
  const onPrimary = themeColor(theme.colors.onPrimary)
  const onSurface = themeColor(theme.colors.onSurface)
  const primary = themeColor(theme.colors.primary)

  return useMemo(() => {
    if (isDarkColor(primary) && isThemeDark) {
      return onSurface
    }
    return onPrimary
  }, [isThemeDark, onPrimary, onSurface, primary])
}

export function withAlpha(color: string, alpha: number) {
  return rgbaString({
    ...parseColor(themeColor(color)),
    a: Math.max(0, Math.min(1, alpha)),
  })
}
