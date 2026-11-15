import { type ComponentProps, useLayoutEffect, useMemo } from 'react'
import {
  type ColorValue,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'
import { DarkTheme, LightTheme, Text, useTheme } from 'react-native-paper'
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'

export function useWebColorScheme(dark: boolean) {
  useLayoutEffect(() => {
    if (Platform.OS !== 'web') {
      return
    }
    const root = document.documentElement
    const { background, outline } = dark ? darkTheme.colors : lightTheme.colors
    const previousScheme = root.style.colorScheme
    const previousScrollbar = root.style.scrollbarColor
    root.style.colorScheme = dark ? 'dark' : 'light'
    root.style.scrollbarColor = `${outline} ${background}`
    return () => {
      root.style.colorScheme = previousScheme
      root.style.scrollbarColor = previousScrollbar
    }
  }, [dark])
}

type AppColors = {
  background: ColorValue
  onSurface: ColorValue
  onSurfaceVariant: ColorValue
  outlineVariant: ColorValue
  primary: ColorValue
  surface: ColorValue
}

export function AppText(props: ComponentProps<typeof Text>) {
  return <Text {...props} maxFontSizeMultiplier={maxFontSizeMultiplier} />
}

export function CornerWaves({ wide }: WideProps) {
  const styles = useAppStyles()
  const theme = useTheme()
  const dark = theme.dark
  const ribbons = wide ? wideRibbons(dark) : narrowRibbons(dark)

  return (
    <Svg
      height={ribbons.height}
      pointerEvents="none"
      style={wide ? styles.wavesWide : styles.wavesNarrow}
      viewBox={ribbons.viewBox}
      width={ribbons.width}
    >
      <Defs>
        {ribbons.paths.map((ribbon) => (
          <RibbonGradient
            id={ribbon.id}
            key={ribbon.id}
            stops={ribbon.stops}
            x1={ribbon.x1}
            x2={ribbon.x2}
            y1={ribbon.y1}
            y2={ribbon.y2}
          />
        ))}
      </Defs>
      {ribbons.paths.map((ribbon) => (
        <Path d={ribbon.d} fill={`url(#${ribbon.id})`} key={ribbon.id} />
      ))}
    </Svg>
  )
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    actionButton: {
      alignSelf: 'stretch',
      width: '100%',
    },
    actionButtonCompact: {
      alignSelf: 'flex-end',
    },
    brandCopy: {
      flex: 1,
      gap: 4,
      justifyContent: 'center',
    },
    brandRow: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      gap: 14,
      minWidth: 0,
    },
    brandRowNarrow: {
      alignItems: 'flex-start',
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.outlineVariant,
      borderRadius: 20,
      borderWidth: 1,
      gap: 12,
      minHeight: 168,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    cardCopy: {
      flex: 1,
      gap: 2,
    },
    cardDocsLink: {
      alignItems: 'center',
      flexDirection: 'row',
      flexShrink: 0,
      gap: 4,
      minHeight: 24,
    },
    cardDocsLinkText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 18,
    },
    cardDocsLinkTextActive: {
      textDecorationLine: 'underline',
    },
    cardFill: {
      flex: 1,
      width: '100%',
    },
    cardFooter: {
      marginTop: 'auto',
      width: '100%',
    },
    cardHeader: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 12,
    },
    cardTitle: {
      color: colors.onSurface,
      fontWeight: '700',
    },
    cardValue: {
      color: colors.onSurfaceVariant,
    },
    dateInput: {
      backgroundColor: 'transparent',
    },
    description: {
      color: colors.onSurfaceVariant,
      fontSize: 16,
      lineHeight: 22,
    },
    descriptionLink: {
      color: colors.primary,
      fontSize: 16,
      lineHeight: 22,
    },
    divider: {
      backgroundColor: colors.outlineVariant,
      marginTop: 4,
    },
    emptyLocales: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    examples: {
      gap: 32,
    },
    examplesWide: {
      gap: 40,
    },
    footer: {
      backgroundColor: colors.background,
      gap: 24,
      paddingTop: 8,
    },
    footerCol: {
      alignItems: 'center',
      gap: 8,
      width: '50%',
    },
    footerCols: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      rowGap: 24,
    },
    footerColWide: {
      flex: 1,
      width: 'auto',
    },
    footerCopy: {
      borderTopColor: colors.outlineVariant,
      borderTopWidth: 1,
      color: colors.onSurfaceVariant,
      fontSize: 13,
      lineHeight: 18,
      paddingTop: 16,
      textAlign: 'center',
    },
    footerHeading: {
      color: colors.onSurface,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
      textAlign: 'center',
    },
    footerLink: {
      color: colors.onSurfaceVariant,
      fontSize: 13,
      lineHeight: 18,
      textAlign: 'center',
    },
    footerLinkPressable: {
      width: '100%',
    },
    footerLinkPressed: {
      color: colors.primary,
    },
    guidelineLink: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 4,
      minHeight: 32,
    },
    guidelineLinkText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 18,
    },
    guidelineLinkTextActive: {
      textDecorationLine: 'underline',
    },
    header: {
      gap: 16,
    },
    headerActions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
    },
    headerTop: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 8,
    },
    libraryNote: {
      color: colors.onSurfaceVariant,
      fontSize: 13,
      lineHeight: 18,
    },
    localeBar: {
      width: '100%',
    },
    localeBarWide: {
      alignSelf: 'flex-start',
      minWidth: 280,
      width: 'auto',
    },
    localeDialog: {
      alignSelf: 'center',
      maxWidth: 520,
      width: '100%',
    },
    localeOption: {
      paddingHorizontal: 16,
    },
    localeOverline: {
      color: colors.onSurfaceVariant,
      fontSize: 11,
      letterSpacing: 0.4,
      lineHeight: 14,
    },
    localeScroll: {
      paddingHorizontal: 0,
    },
    localeTrigger: {
      alignItems: 'center',
      borderColor: colors.outlineVariant,
      borderRadius: 20,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 10,
      minHeight: 56,
      paddingHorizontal: 14,
      paddingVertical: 10,
      width: '100%',
    },
    localeValue: {
      color: colors.onSurface,
      fontSize: 15,
      lineHeight: 20,
    },
    localeValueBlock: {
      flex: 1,
      flexShrink: 1,
      gap: 2,
      minWidth: 0,
    },
    logo: {
      height: 64,
      width: 64,
    },
    page: {
      alignSelf: 'center',
      gap: 14,
      maxWidth: 440,
      width: '100%',
    },
    pageWide: {
      gap: 22,
      maxWidth: 1120,
    },
    screen: {
      backgroundColor: colors.background,
      flex: 1,
      overflow: 'hidden',
    },
    scrollContent: {
      paddingHorizontal: 16,
    },
    scrollContentWide: {
      paddingHorizontal: 40,
    },
    searchbar: {
      borderColor: colors.outlineVariant,
      borderWidth: 1,
      marginBottom: 12,
      marginHorizontal: 16,
    },
    searchInput: {
      color: colors.onSurface,
    },
    section: {
      gap: 12,
    },
    sectionCell: {
      flex: 1,
      minWidth: 0,
    },
    sectionCopy: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
      lineHeight: 20,
    },
    sectionHeader: {
      gap: 4,
    },
    sectionRow: {
      alignItems: 'stretch',
      flexDirection: 'row',
      gap: 16,
    },
    sectionTitle: {
      color: colors.onSurface,
      flexShrink: 1,
      fontWeight: '700',
    },
    sectionTitleRow: {
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'space-between',
    },
    stack: {
      gap: 14,
    },
    title: {
      color: colors.onSurface,
      fontSize: 30,
      fontWeight: '700',
      letterSpacing: -0.6,
      lineHeight: 34,
    },
    themeToggle: {
      margin: 0,
    },
    titleWide: {
      color: colors.onSurface,
      fontSize: 36,
      lineHeight: 42,
    },
    version: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.4,
      lineHeight: 18,
    },
    wavesNarrow: {
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    wavesWide: {
      maxWidth: 980,
      position: 'absolute',
      right: 0,
      top: 0,
    },
  })
}

function curvePoint(
  p0: WavePoint,
  p1: WavePoint,
  p2: WavePoint,
  p3: WavePoint,
  t: number
) {
  const mt = 1 - t
  const mt2 = mt * mt
  const t2 = t * t
  return {
    x:
      mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    y:
      mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
  }
}

function curveTangent(
  p0: WavePoint,
  p1: WavePoint,
  p2: WavePoint,
  p3: WavePoint,
  t: number
) {
  const mt = 1 - t
  return {
    x:
      3 * mt * mt * (p1.x - p0.x) +
      6 * mt * t * (p2.x - p1.x) +
      3 * t * t * (p3.x - p2.x),
    y:
      3 * mt * mt * (p1.y - p0.y) +
      6 * mt * t * (p2.y - p1.y) +
      3 * t * t * (p3.y - p2.y),
  }
}

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#111418',
    onBackground: '#E2E2E5',
    onPrimary: '#04305F',
    onPrimaryContainer: '#D6E3FF',
    onSecondary: '#283041',
    onSecondaryContainer: '#DAE2F9',
    onSurface: '#E2E2E5',
    onSurfaceVariant: '#C3C6CF',
    outline: '#8D9199',
    outlineVariant: '#43474E',
    primary: '#A9C7FF',
    primaryContainer: '#254777',
    secondary: '#BEC6DC',
    secondaryContainer: '#3E4758',
    surface: '#1A1C1E',
    surfaceVariant: '#49454F',
  },
}
export const docsBase = 'https://web-ridge.github.io/react-native-paper-dates'

export const docsUrl = `${docsBase}/`
type FooterColumn = {
  links: { label: string; url: string }[]
  title: string
}

const footerColumns: FooterColumn[] = [
  {
    links: [
      { label: 'Introduction', url: `${docsBase}/guide/introduction` },
      { label: 'Installation', url: `${docsBase}/guide/installation` },
      { label: 'Localization', url: `${docsBase}/guide/localization` },
    ],
    title: 'Docs',
  },
  {
    links: [
      {
        label: 'React Native Use Form',
        url: 'https://github.com/web-ridge/react-native-use-form',
      },
      {
        label: 'React Native Paper Tabs',
        url: 'https://github.com/web-ridge/react-native-paper-tabs',
      },
      {
        label: 'React Native Ridge Navigation',
        url: 'https://github.com/web-ridge/react-native-ridge-navigation',
      },
      {
        label: 'React Ridge Translations',
        url: 'https://github.com/web-ridge/react-ridge-translations',
      },
      {
        label: 'React Ridge State',
        url: 'https://github.com/web-ridge/react-ridge-state',
      },
    ],
    title: 'Other libraries',
  },
  {
    links: [
      {
        label: 'YouTube',
        url: 'https://www.youtube.com/watch?v=SHhQU2doTug',
      },
      { label: 'Demo', url: 'https://www.reactnativepaperdates.com/' },
      { label: 'webRidge', url: 'https://www.webridge.nl/' },
    ],
    title: 'More',
  },
  {
    links: [
      {
        label: 'Report Bug',
        url: 'https://github.com/web-ridge/react-native-paper-dates/issues',
      },
    ],
    title: 'Support',
  },
]
export const githubUrl = 'https://github.com/web-ridge/react-native-paper-dates'

export const lightTheme = {
  ...LightTheme,
  colors: {
    ...LightTheme.colors,
    background: '#F4F6FA',
    onBackground: '#1A1C1E',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#001B3D',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#131C2B',
    onSurface: '#1A1C1E',
    onSurfaceVariant: '#43474E',
    outline: '#73777F',
    outlineVariant: '#C3C6CF',
    primary: '#3F5F90',
    primaryContainer: '#D6E3FF',
    secondary: '#565E71',
    secondaryContainer: '#DAE2F9',
    surface: '#FFFFFF',
    surfaceVariant: '#E7E0EC',
  },
}
function narrowRibbons(dark: boolean): WaveLayout {
  return {
    height: 220,
    paths: [
      {
        d: narrowDarkRibbon,
        id: 'ribbonDarkNarrow',
        stops: [
          {
            offset: '0',
            stopColor: dark ? '#04305F' : '#D6E3FF',
            stopOpacity: '0',
          },
          {
            offset: '0.22',
            stopColor: dark ? '#254777' : '#8FB3EF',
            stopOpacity: '0.55',
          },
          { offset: '0.55', stopColor: '#3F5F90', stopOpacity: '0.88' },
          {
            offset: '0.82',
            stopColor: dark ? '#1A3A66' : '#A9C7FF',
            stopOpacity: '0.4',
          },
          {
            offset: '1',
            stopColor: dark ? '#0C0E12' : '#F4F6FA',
            stopOpacity: '0',
          },
        ],
        x1: '-20',
        x2: '420',
        y1: '10',
        y2: '80',
      },
      {
        d: narrowLightRibbon,
        id: 'ribbonLightNarrow',
        stops: [
          {
            offset: '0',
            stopColor: dark ? '#5675A6' : '#FFFFFF',
            stopOpacity: '0',
          },
          {
            offset: '0.28',
            stopColor: '#A9C7FF',
            stopOpacity: dark ? 0.28 : 0.55,
          },
          {
            offset: '0.55',
            stopColor: '#D6E3FF',
            stopOpacity: dark ? 0.62 : 0.85,
          },
          {
            offset: '0.8',
            stopColor: '#8FB3EF',
            stopOpacity: dark ? 0.28 : 0.4,
          },
          {
            offset: '1',
            stopColor: dark ? '#254777' : '#F4F6FA',
            stopOpacity: '0',
          },
        ],
        x1: '0',
        x2: '420',
        y1: '70',
        y2: '180',
      },
    ],
    viewBox: '0 0 390 220',
    width: '100%',
  }
}
function RibbonGradient({
  id: gradientId,
  stops,
  x1,
  x2,
  y1,
  y2,
}: Omit<WaveRibbon, 'd'>) {
  return (
    <LinearGradient
      gradientUnits="userSpaceOnUse"
      id={gradientId}
      x1={x1}
      x2={x2}
      y1={y1}
      y2={y2}
    >
      {stops.map((stop) => (
        <Stop
          key={stop.offset}
          offset={stop.offset}
          stopColor={stop.stopColor}
          stopOpacity={stop.stopOpacity}
        />
      ))}
    </LinearGradient>
  )
}

// Filled outline of a thick curve. A gradient stroke breaks into visible seams.
function ribbonPath(
  segments: [WavePoint, WavePoint, WavePoint, WavePoint][],
  width: number
) {
  const points: {
    nx: number
    ny: number
    tx: number
    ty: number
    x: number
    y: number
  }[] = []
  const samples = 64
  segments.forEach((segment, segmentIndex) => {
    const [p0, p1, p2, p3] = segment
    for (let i = segmentIndex === 0 ? 0 : 1; i <= samples; i++) {
      const t = i / samples
      const point = curvePoint(p0, p1, p2, p3, t)
      let tangent = curveTangent(p0, p1, p2, p3, t)
      let length = Math.hypot(tangent.x, tangent.y)
      if (length < 0.001) {
        tangent = curveTangent(p0, p1, p2, p3, Math.min(1, t + 0.02))
        length = Math.hypot(tangent.x, tangent.y) || 1
      }
      points.push({
        nx: -tangent.y / length,
        ny: tangent.x / length,
        tx: tangent.x / length,
        ty: tangent.y / length,
        x: point.x,
        y: point.y,
      })
    }
  })

  const end = points[points.length - 1]
  const format = (value: number) =>
    Math.abs(value) < 0.05 ? '0' : (Math.round(value * 10) / 10).toString()
  const half = width / 2
  const cap = (
    center: WavePoint,
    from: WavePoint,
    to: WavePoint,
    outward: WavePoint
  ) => {
    const endAngle = Math.atan2(to.y - center.y, to.x - center.x)
    const start = Math.atan2(from.y - center.y, from.x - center.x)
    let delta = endAngle - start
    while (delta <= -Math.PI) delta += Math.PI * 2
    while (delta > Math.PI) delta -= Math.PI * 2
    const alternate = delta > 0 ? delta - Math.PI * 2 : delta + Math.PI * 2
    const outline: WavePoint[] = []
    const score = (sweep: number) => {
      const mid = start + sweep / 2
      return Math.cos(mid) * outward.x + Math.sin(mid) * outward.y
    }
    const steps = 14
    const sweep = score(delta) >= score(alternate) ? delta : alternate
    for (let i = 1; i < steps; i++) {
      const angle = start + (sweep * i) / steps
      outline.push({
        x: center.x + Math.cos(angle) * half,
        y: center.y + Math.sin(angle) * half,
      })
    }
    return outline
  }
  const left = points.map((point) => ({
    x: point.x + point.nx * half,
    y: point.y + point.ny * half,
  }))
  const right = points.map((point) => ({
    x: point.x - point.nx * half,
    y: point.y - point.ny * half,
  }))
  const endRight = right[right.length - 1]
  const start = points[0]
  const startRight = right[0]
  const outline = [
    ...left,
    ...cap(end, left[left.length - 1], endRight, { x: end.tx, y: end.ty }),
    ...right.reverse(),
    ...cap(start, startRight, left[0], { x: -start.tx, y: -start.ty }),
  ]
  return `M${outline.map((point) => `${format(point.x)} ${format(point.y)}`).join('L')}Z`
}

export function SiteFooter({ wide }: WideProps) {
  const styles = useAppStyles()

  return (
    <View style={styles.footer}>
      <View style={styles.footerCols}>
        {footerColumns.map((column) => (
          <View
            key={column.title}
            style={[styles.footerCol, wide && styles.footerColWide]}
          >
            <AppText style={styles.footerHeading}>{column.title}</AppText>
            {column.links.map((link) => (
              <Pressable
                accessibilityRole="link"
                key={link.label}
                onPress={() => Linking.openURL(link.url)}
                style={styles.footerLinkPressable}
              >
                {({ pressed }) => (
                  <AppText
                    style={[
                      styles.footerLink,
                      pressed && styles.footerLinkPressed,
                    ]}
                  >
                    {link.label}
                  </AppText>
                )}
              </Pressable>
            ))}
          </View>
        ))}
      </View>
      <AppText style={styles.footerCopy}>
        Copyright © {new Date().getFullYear()} Web Ridge
      </AppText>
    </View>
  )
}
export function useAppStyles() {
  const {
    colors: {
      background,
      onSurface,
      onSurfaceVariant,
      outlineVariant,
      primary,
      surface,
    },
  } = useTheme()

  return useMemo(
    () =>
      createStyles({
        background,
        onSurface,
        onSurfaceVariant,
        outlineVariant,
        primary,
        surface,
      }),
    [background, onSurface, onSurfaceVariant, outlineVariant, primary, surface]
  )
}

type WavePoint = { x: number; y: number }

type WaveRibbon = {
  d: string
  id: string
  stops: {
    offset: string
    stopColor: string
    stopOpacity: number | string
  }[]
  x1: string
  x2: string
  y1: string
  y2: string
}

type WaveLayout = {
  height: number
  paths: WaveRibbon[]
  viewBox: string
  width: string
}

type WideProps = { wide: boolean }

function wideRibbons(dark: boolean): WaveLayout {
  return {
    height: 380,
    paths: [
      {
        d: wideDarkRibbon,
        id: 'ribbonDark',
        stops: [
          {
            offset: '0',
            stopColor: dark ? '#04305F' : '#D6E3FF',
            stopOpacity: '0',
          },
          {
            offset: '0.22',
            stopColor: dark ? '#254777' : '#8FB3EF',
            stopOpacity: '0.55',
          },
          { offset: '0.58', stopColor: '#3F5F90', stopOpacity: '0.9' },
          {
            offset: '0.86',
            stopColor: dark ? '#1A3A66' : '#A9C7FF',
            stopOpacity: '0.45',
          },
          {
            offset: '1',
            stopColor: dark ? '#0C0E12' : '#F4F6FA',
            stopOpacity: '0',
          },
        ],
        x1: '160',
        x2: '920',
        y1: '0',
        y2: '220',
      },
      {
        d: wideLightRibbon,
        id: 'ribbonLight',
        stops: [
          {
            offset: '0',
            stopColor: dark ? '#5675A6' : '#FFFFFF',
            stopOpacity: '0',
          },
          {
            offset: '0.3',
            stopColor: '#A9C7FF',
            stopOpacity: dark ? 0.45 : 0.7,
          },
          {
            offset: '0.62',
            stopColor: '#D6E3FF',
            stopOpacity: dark ? 0.78 : 0.9,
          },
          {
            offset: '0.88',
            stopColor: '#8FB3EF',
            stopOpacity: dark ? 0.3 : 0.45,
          },
          {
            offset: '1',
            stopColor: dark ? '#254777' : '#F4F6FA',
            stopOpacity: '0',
          },
        ],
        x1: '220',
        x2: '960',
        y1: '80',
        y2: '340',
      },
    ],
    viewBox: '0 0 960 380',
    width: '68%',
  }
}
const maxFontSizeMultiplier = 1.5

const narrowDarkRibbon = ribbonPath(
  [
    [
      { x: -80, y: 36 },
      { x: 40, y: -8 },
      { x: 140, y: 92 },
      { x: 250, y: 34 },
    ],
    [
      { x: 250, y: 34 },
      { x: 330, y: -6 },
      { x: 390, y: 70 },
      { x: 500, y: 18 },
    ],
  ],
  86
)
const narrowLightRibbon = ribbonPath(
  [
    [
      { x: -60, y: 118 },
      { x: 50, y: 62 },
      { x: 150, y: 168 },
      { x: 270, y: 108 },
    ],
    [
      { x: 270, y: 108 },
      { x: 350, y: 66 },
      { x: 410, y: 150 },
      { x: 520, y: 92 },
    ],
  ],
  78
)
export const wideBreakpoint = 960
const wideDarkRibbon = ribbonPath(
  [
    [
      { x: 40, y: 70 },
      { x: 220, y: 10 },
      { x: 340, y: 150 },
      { x: 540, y: 78 },
    ],
    [
      { x: 540, y: 78 },
      { x: 700, y: 20 },
      { x: 800, y: 120 },
      { x: 1040, y: 30 },
    ],
  ],
  118
)
const wideLightRibbon = ribbonPath(
  [
    [
      { x: 80, y: 190 },
      { x: 280, y: 110 },
      { x: 420, y: 280 },
      { x: 640, y: 176 },
    ],
    [
      { x: 640, y: 176 },
      { x: 800, y: 100 },
      { x: 880, y: 250 },
      { x: 1100, y: 150 },
    ],
  ],
  100
)
