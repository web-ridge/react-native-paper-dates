import { type ComponentProps, useLayoutEffect, useMemo } from 'react'
import {
  type ColorValue,
  Linking,
  Platform,
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  View,
} from 'react-native'
import { DarkTheme, Icon, LightTheme, Text, useTheme } from 'react-native-paper'
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

type ExternalLinkProps = {
  accessibilityLabel: string
  hitSlop?: number
  label: string
  url: string
}

export function ExternalLink({
  accessibilityLabel,
  hitSlop,
  label,
  url,
}: ExternalLinkProps) {
  const styles = useAppStyles()
  const theme = useTheme()

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="link"
      hitSlop={hitSlop}
      onPress={() => Linking.openURL(url)}
    >
      {(state: PressableStateCallbackType & { hovered?: boolean }) => (
        <View style={styles.externalLink}>
          <AppText
            style={[
              styles.externalLinkText,
              (state.hovered || state.pressed) && styles.externalLinkTextActive,
            ]}
          >
            {label}
          </AppText>
          <Icon color={theme.colors.primary} size={16} source="open-in-new" />
        </View>
      )}
    </Pressable>
  )
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
    cardFill: {
      maxWidth: '48%',
      minWidth: 0,
      width: '48%',
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
    externalLink: {
      alignItems: 'center',
      flexDirection: 'row',
      flexShrink: 0,
      gap: 4,
      minHeight: 32,
    },
    externalLinkText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 18,
    },
    externalLinkTextActive: {
      textDecorationLine: 'underline',
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
      flexWrap: 'wrap',
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

const narrowDarkRibbon =
  'M-65.2 76.4L-60.9 74.9L-56.6 73.5L-52.3 72.3L-48 71.3L-43.8 70.3L-39.6 69.6L-35.4 68.9L-31.2 68.4L-26.9 68L-22.7 67.7L-18.5 67.5L-14.2 67.4L-9.9 67.5L-5.5 67.6L-1.2 67.8L3.2 68.1L7.7 68.5L12.1 69L16.6 69.6L21.2 70.2L25.8 71L30.4 71.8L35.1 72.6L39.8 73.5L44.6 74.5L49.4 75.5L54.3 76.5L59.1 77.6L64.1 78.7L69.1 79.9L74.1 81L79.2 82.2L84.3 83.3L89.5 84.5L94.7 85.6L100 86.8L105.4 87.9L110.8 88.9L116.2 90L121.7 90.9L127.3 91.8L132.9 92.7L138.6 93.4L144.4 94.1L150.2 94.6L156.1 95.1L162 95.4L168.1 95.6L174.1 95.6L180.3 95.5L186.5 95.2L192.7 94.8L199 94.1L205.4 93.3L211.8 92.2L218.2 91L224.7 89.5L231.1 87.7L237.6 85.8L244.1 83.5L250.6 81L257.1 78.3L263.6 75.3L270.1 72L271.7 71.3L274 70.2L276.4 69.3L278.6 68.5L280.9 67.8L283.1 67.2L285.2 66.6L287.4 66.2L289.6 65.8L291.8 65.5L294 65.2L296.3 65L298.6 64.9L300.9 64.8L303.3 64.8L305.8 64.9L308.3 65L310.9 65.2L313.5 65.5L316.3 65.7L319.1 66.1L322 66.5L325 67L328.1 67.5L331.2 68L334.4 68.6L337.8 69.2L341.1 69.9L344.6 70.6L348.2 71.3L351.8 72L355.6 72.7L359.4 73.4L363.3 74.2L367.3 74.9L371.4 75.6L375.6 76.3L379.8 76.9L384.2 77.5L388.6 78.1L393.2 78.6L397.8 79L402.5 79.4L407.3 79.6L412.2 79.8L417.2 79.9L422.2 79.9L427.3 79.8L432.6 79.5L437.9 79.2L443.2 78.6L448.7 78L454.2 77.2L459.7 76.2L465.4 75.1L471.1 73.8L476.8 72.3L482.6 70.7L488.4 68.8L494.3 66.8L500.3 64.6L506.3 62.2L512.3 59.7L518.4 56.9L526.6 51.8L533.4 45.1L538.6 36.9L541.9 27.9L543 18.3L542 8.7L538.9 -0.4L533.8 -8.6L527.1 -15.4L518.9 -20.6L509.9 -23.9L500.3 -25L490.7 -24L481.6 -20.9L477.5 -19L473.4 -17.2L469.4 -15.6L465.5 -14.2L461.8 -12.9L458.1 -11.8L454.4 -10.7L450.9 -9.8L447.4 -9L443.9 -8.3L440.6 -7.8L437.2 -7.3L433.9 -6.9L430.7 -6.5L427.4 -6.3L424.2 -6.2L421 -6.1L417.8 -6.1L414.7 -6.1L411.5 -6.3L408.3 -6.4L405.1 -6.7L401.9 -7L398.7 -7.3L395.4 -7.7L392.2 -8.2L388.9 -8.7L385.6 -9.2L382.2 -9.8L378.8 -10.4L375.4 -11.1L371.9 -11.7L368.4 -12.4L364.9 -13.1L361.3 -13.8L357.6 -14.5L353.9 -15.2L350.1 -16L346.3 -16.6L342.4 -17.3L338.5 -18L334.5 -18.6L330.4 -19.2L326.3 -19.7L322 -20.1L317.7 -20.5L313.4 -20.8L308.9 -21L304.4 -21.1L299.8 -21.1L295.2 -21L290.4 -20.8L285.7 -20.4L280.8 -19.8L275.9 -19.1L271 -18.2L266 -17.2L261 -16L256 -14.5L250.9 -12.9L245.9 -11.1L240.8 -9.1L235.8 -6.9L229.9 -4L226.1 -2.1L222.3 -0.3L218.6 1.2L214.8 2.7L211.1 3.9L207.5 5.1L203.8 6L200.1 6.9L196.4 7.6L192.7 8.2L189 8.7L185.2 9.1L181.4 9.4L177.6 9.6L173.7 9.6L169.8 9.6L165.8 9.5L161.7 9.3L157.6 8.9L153.4 8.5L149.2 8.1L144.9 7.5L140.5 6.8L136.1 6.1L131.6 5.3L127 4.5L122.4 3.6L117.7 2.6L112.9 1.6L108.1 0.5L103.2 -0.6L98.3 -1.7L93.3 -2.8L88.2 -4L83.1 -5.1L77.9 -6.3L72.6 -7.5L67.3 -8.6L61.9 -9.8L56.5 -10.9L50.9 -11.9L45.3 -12.9L39.7 -13.9L33.9 -14.8L28.1 -15.6L22.2 -16.4L16.2 -17L10.2 -17.6L4.1 -18L-2.1 -18.3L-8.3 -18.5L-14.6 -18.6L-21 -18.4L-27.5 -18.2L-34 -17.7L-40.6 -17.1L-47.2 -16.3L-53.9 -15.2L-60.6 -14L-67.4 -12.5L-74.2 -10.8L-81.1 -8.9L-87.9 -6.8L-94.8 -4.4L-103.4 -0.1L-110.9 6L-116.7 13.7L-120.8 22.4L-122.8 31.8L-122.7 41.4L-120.4 50.8L-116.1 59.4L-110 66.9L-102.3 72.7L-93.6 76.8L-84.2 78.8L-74.6 78.7Z'
const narrowLightRibbon =
  'M-42.3 152.8L-38.4 150.9L-34.5 149.1L-30.7 147.6L-26.9 146.2L-23.1 145L-19.4 144L-15.6 143L-11.8 142.3L-8.1 141.6L-4.2 141.1L-0.4 140.6L3.5 140.3L7.4 140.2L11.4 140.1L15.4 140.1L19.5 140.2L23.6 140.4L27.8 140.8L32 141.2L36.3 141.7L40.7 142.2L45.1 142.9L49.6 143.6L54.1 144.4L58.8 145.3L63.4 146.2L68.2 147.2L73 148.2L77.8 149.2L82.7 150.3L87.7 151.4L92.8 152.6L97.9 153.7L103 154.8L108.3 156L113.5 157.1L118.9 158.2L124.3 159.2L129.8 160.3L135.4 161.2L141 162.1L146.7 163L152.5 163.7L158.3 164.4L164.2 165L170.2 165.4L176.3 165.8L182.4 166L188.6 166.1L194.9 166L201.2 165.7L207.6 165.3L214 164.7L220.5 163.8L227.1 162.8L233.7 161.6L240.3 160.1L247 158.4L253.7 156.5L260.4 154.3L267.2 151.8L273.9 149.1L280.7 146.1L287.4 142.9L290.6 141.3L293 140.2L295.4 139.2L297.7 138.3L300 137.6L302.2 136.9L304.4 136.4L306.6 135.9L308.8 135.5L311 135.2L313.2 135L315.5 134.8L317.8 134.7L320.2 134.7L322.6 134.8L325.1 134.9L327.7 135.1L330.3 135.3L333 135.6L335.8 136L338.6 136.4L341.6 136.9L344.6 137.4L347.7 138L350.9 138.7L354.1 139.4L357.5 140.1L360.9 140.8L364.4 141.6L368 142.4L371.6 143.3L375.4 144.1L379.2 144.9L383.2 145.8L387.2 146.6L391.3 147.4L395.5 148.1L399.7 148.8L404.1 149.5L408.6 150.1L413.1 150.7L417.8 151.2L422.5 151.6L427.3 151.9L432.2 152.1L437.2 152.2L442.3 152.2L447.4 152L452.6 151.7L457.9 151.3L463.3 150.7L468.8 150L474.3 149.1L479.8 148L485.5 146.7L491.1 145.3L496.9 143.6L502.7 141.8L508.5 139.8L514.3 137.5L520.2 135.1L526.2 132.4L532.2 129.6L538.2 126.5L545.4 121.6L551.4 115.2L555.7 107.6L558.3 99.3L559 90.6L557.7 81.9L554.5 73.8L549.6 66.6L543.2 60.6L535.6 56.3L527.3 53.7L518.6 53L509.9 54.3L501.8 57.5L497.6 59.7L493.5 61.6L489.5 63.4L485.6 65L481.7 66.5L478 67.8L474.3 68.9L470.8 70L467.3 70.9L463.8 71.6L460.4 72.3L457.1 72.9L453.8 73.3L450.6 73.7L447.3 73.9L444.1 74.1L441 74.2L437.8 74.2L434.6 74.1L431.5 74L428.3 73.8L425.1 73.5L421.9 73.2L418.7 72.8L415.5 72.4L412.3 71.9L409 71.3L405.7 70.7L402.3 70.1L399 69.4L395.6 68.7L392.1 67.9L388.6 67.1L385.1 66.3L381.5 65.5L377.9 64.7L374.2 63.9L370.5 63.1L366.7 62.3L362.8 61.5L358.9 60.8L354.9 60L350.9 59.4L346.8 58.7L342.6 58.2L338.3 57.7L334 57.3L329.6 57L325.1 56.8L320.5 56.7L315.9 56.8L311.2 57L306.4 57.3L301.6 57.8L296.7 58.5L291.8 59.3L286.9 60.4L281.9 61.6L276.9 63.1L271.9 64.7L266.9 66.6L261.8 68.7L256.9 71L252.6 73.1L248.1 75.3L243.7 77.2L239.3 78.9L235 80.5L230.7 81.9L226.5 83.1L222.3 84.2L218.1 85.2L213.9 85.9L209.7 86.6L205.5 87.1L201.2 87.5L197 87.8L192.7 88L188.5 88.1L184.2 88L179.8 87.9L175.4 87.6L171 87.3L166.6 86.8L162.1 86.3L157.5 85.7L152.9 85.1L148.3 84.3L143.7 83.5L139 82.6L134.2 81.7L129.4 80.7L124.6 79.7L119.7 78.6L114.7 77.5L109.7 76.4L104.7 75.3L99.6 74.2L94.5 73L89.3 71.9L84.1 70.8L78.8 69.7L73.5 68.7L68.1 67.7L62.6 66.7L57.1 65.8L51.5 65L45.9 64.2L40.2 63.6L34.4 63L28.6 62.6L22.7 62.3L16.8 62.1L10.8 62.1L4.7 62.2L-1.4 62.5L-7.6 63L-13.9 63.7L-20.2 64.5L-26.5 65.6L-32.8 67L-39.2 68.5L-45.6 70.3L-52 72.4L-58.5 74.7L-64.9 77.3L-71.3 80.1L-77.7 83.2L-85 88.1L-91 94.4L-95.5 101.9L-98.2 110.2L-99 118.9L-97.8 127.5L-94.8 135.7L-89.9 143L-83.6 149L-76.1 153.5L-67.8 156.2L-59.1 157L-50.5 155.8Z'
export const wideBreakpoint = 960
const wideDarkRibbon =
  'M58.7 126L65.5 123.8L72.2 121.9L78.8 120.2L85.3 118.7L91.7 117.4L98.1 116.4L104.4 115.5L110.7 114.8L117 114.3L123.2 113.9L129.4 113.7L135.7 113.6L141.9 113.7L148.1 114L154.4 114.3L160.7 114.8L167 115.5L173.3 116.2L179.7 117.1L186.2 118L192.7 119.1L199.3 120.3L205.9 121.6L212.6 122.9L219.4 124.4L226.2 125.9L233.1 127.4L240.1 129L247.1 130.7L254.3 132.4L261.5 134.1L268.8 135.9L276.2 137.6L283.7 139.4L291.3 141.2L299 142.9L306.8 144.6L314.7 146.2L322.7 147.8L330.8 149.3L339 150.8L347.4 152.1L355.8 153.4L364.4 154.5L373.1 155.5L381.9 156.4L390.9 157.1L399.9 157.6L409.1 158L418.4 158.1L427.8 158.1L437.4 157.8L447 157.3L456.8 156.6L466.7 155.6L476.6 154.3L486.7 152.8L496.9 150.9L507.2 148.8L517.6 146.4L528 143.7L538.6 140.6L549.2 137.2L560 133.5L566.2 131.3L572.3 129.4L578.2 127.6L584.1 126L589.9 124.6L595.6 123.3L601.3 122.2L607 121.2L612.6 120.4L618.2 119.7L623.8 119.1L629.5 118.6L635.1 118.2L640.8 117.9L646.4 117.8L652.2 117.7L658 117.7L663.8 117.8L669.7 118L675.7 118.2L681.8 118.5L687.9 118.9L694.2 119.4L700.5 119.9L706.9 120.4L713.4 121L720.1 121.6L726.8 122.2L733.6 122.8L740.6 123.5L747.7 124.1L754.9 124.8L762.2 125.4L769.7 126L777.3 126.5L785 127.1L792.9 127.5L800.8 127.9L809 128.2L817.2 128.4L825.6 128.6L834.2 128.6L842.9 128.5L851.7 128.3L860.7 128L869.8 127.5L879.1 126.9L888.5 126.1L898.1 125.1L907.8 124L917.7 122.7L927.7 121.1L937.9 119.4L948.3 117.5L958.8 115.4L969.4 113L980.2 110.4L991.2 107.6L1002.4 104.5L1013.7 101.2L1025.2 97.6L1036.8 93.8L1048.7 89.6L1060.7 85.2L1072.5 79.2L1082.6 70.8L1090.6 60.3L1096.1 48.2L1098.8 35.3L1098.5 22.1L1095.2 9.3L1089.2 -2.5L1080.8 -12.6L1070.3 -20.6L1058.2 -26.1L1045.3 -28.8L1032.1 -28.5L1019.3 -25.2L1009 -21.5L999 -18L989.1 -14.7L979.5 -11.7L970.1 -9L960.8 -6.4L951.8 -4.1L942.9 -2L934.2 0L925.7 1.7L917.4 3.2L909.2 4.6L901.1 5.8L893.2 6.9L885.4 7.8L877.7 8.6L870.2 9.2L862.7 9.7L855.4 10.1L848.1 10.4L840.9 10.5L833.8 10.6L826.8 10.6L819.8 10.5L812.9 10.3L806 10L799.1 9.7L792.3 9.3L785.5 8.8L778.7 8.3L771.9 7.8L765.1 7.2L758.3 6.6L751.5 6L744.6 5.4L737.8 4.7L730.9 4.1L724 3.4L717 2.8L710 2.2L702.9 1.7L695.8 1.2L688.6 0.7L681.3 0.4L674 0.1L666.6 -0.2L659.1 -0.3L651.6 -0.3L643.9 -0.2L636.2 0L628.4 0.4L620.5 0.9L612.6 1.6L604.5 2.5L596.4 3.5L588.2 4.7L579.9 6.2L571.5 7.8L563.1 9.7L554.6 11.8L546 14.1L537.4 16.7L528.7 19.5L520 22.5L512.1 25.2L504.4 27.7L496.7 29.9L489.2 31.8L481.9 33.6L474.6 35.1L467.4 36.4L460.3 37.4L453.3 38.3L446.4 39L439.5 39.5L432.7 39.9L425.9 40.1L419.1 40.1L412.4 40L405.7 39.8L399 39.4L392.3 38.8L385.6 38.2L378.9 37.4L372.2 36.5L365.5 35.5L358.7 34.4L351.9 33.2L345.1 32L338.3 30.6L331.4 29.2L324.4 27.7L317.5 26.1L310.4 24.5L303.3 22.8L296.2 21.1L289 19.4L281.7 17.6L274.4 15.9L267 14.1L259.5 12.4L251.9 10.7L244.3 9L236.5 7.4L228.7 5.8L220.8 4.3L212.8 2.8L204.7 1.5L196.5 0.3L188.2 -0.9L179.7 -1.9L171.2 -2.7L162.6 -3.4L153.8 -3.9L145 -4.2L136 -4.4L127 -4.3L117.8 -4L108.5 -3.4L99.2 -2.6L89.7 -1.6L80.2 -0.3L70.6 1.4L60.9 3.3L51.1 5.5L41.2 8L31.3 10.9L21.3 14L9.4 19.6L-1.1 27.7L-9.5 37.9L-15.4 49.7L-18.5 62.5L-18.7 75.7L-16 88.7L-10.4 100.6L-2.3 111.1L7.9 119.5L19.7 125.4L32.5 128.5L45.7 128.7Z'
const wideLightRibbon =
  'M98.6 236.4L106.5 233.4L114.3 230.7L122 228.3L129.6 226.2L137.1 224.3L144.5 222.7L151.9 221.3L159.3 220.2L166.6 219.3L173.8 218.7L181.1 218.2L188.4 217.9L195.6 217.8L202.9 217.9L210.2 218.1L217.5 218.6L224.9 219.2L232.3 219.9L239.7 220.7L247.1 221.8L254.7 222.9L262.2 224.1L269.9 225.5L277.6 226.9L285.3 228.5L293.1 230.1L301 231.8L309 233.5L317 235.3L325.2 237.1L333.3 238.9L341.6 240.8L350 242.7L358.4 244.5L367 246.3L375.6 248.1L384.4 249.8L393.2 251.4L402.2 253L411.2 254.5L420.4 255.8L429.7 257L439 258.1L448.6 259L458.2 259.8L467.9 260.3L477.8 260.7L487.7 260.8L497.8 260.7L508 260.3L518.4 259.7L528.8 258.8L539.3 257.6L550 256.1L560.7 254.2L571.5 252.1L582.5 249.5L593.5 246.6L604.6 243.4L615.8 239.7L627.1 235.7L638.4 231.3L649.9 226.5L661.4 221.2L667.5 218.4L673.4 215.9L679.1 213.7L684.7 211.8L690.2 210.1L695.5 208.6L700.8 207.4L705.9 206.3L711 205.4L716 204.7L721 204.2L725.9 203.9L730.8 203.7L735.8 203.6L740.7 203.7L745.7 203.9L750.8 204.2L755.8 204.7L761 205.2L766.2 205.9L771.5 206.7L776.9 207.6L782.3 208.6L787.9 209.7L793.6 210.9L799.3 212.2L805.2 213.5L811.2 214.9L817.3 216.3L823.5 217.8L829.8 219.2L836.3 220.7L842.9 222.2L849.6 223.7L856.5 225.2L863.5 226.6L870.7 228L877.9 229.3L885.4 230.5L893 231.6L900.7 232.7L908.6 233.6L916.7 234.3L924.9 234.9L933.2 235.4L941.8 235.6L950.4 235.7L959.3 235.5L968.2 235.2L977.4 234.6L986.6 233.7L996.1 232.6L1005.6 231.2L1015.4 229.6L1025.2 227.6L1035.2 225.3L1045.4 222.8L1055.7 219.9L1066.1 216.7L1076.7 213.2L1087.5 209.3L1098.4 205.1L1109.5 200.5L1120.7 195.5L1130.3 189.8L1138.4 182L1144.6 172.7L1148.5 162.2L1150 151.1L1149 140L1145.5 129.3L1139.8 119.7L1132 111.6L1122.7 105.4L1112.2 101.5L1101.1 100L1090 101L1079.3 104.5L1070.1 108.5L1061.2 112.3L1052.4 115.6L1043.9 118.7L1035.7 121.5L1027.6 123.9L1019.7 126.1L1012 128.1L1004.5 129.8L997.2 131.2L990.1 132.4L983.1 133.4L976.2 134.3L969.5 134.9L962.9 135.3L956.4 135.6L950 135.7L943.6 135.6L937.4 135.5L931.2 135.1L925.1 134.7L919 134.1L913 133.4L906.9 132.6L900.9 131.7L894.9 130.7L888.9 129.7L882.9 128.5L876.9 127.3L870.9 126L864.8 124.7L858.7 123.3L852.5 121.8L846.3 120.4L840.1 118.9L833.8 117.5L827.4 116L820.9 114.5L814.4 113.1L807.8 111.7L801.1 110.4L794.3 109.2L787.4 108L780.3 106.9L773.2 106L766 105.2L758.6 104.5L751.1 104L743.6 103.7L735.9 103.6L728 103.7L720.1 104L712.1 104.6L704 105.5L695.8 106.6L687.5 108L679.1 109.7L670.6 111.8L662.1 114.1L653.5 116.8L644.8 119.8L636.1 123.1L627.4 126.8L618.6 130.8L609.6 134.9L600.8 138.6L592.1 142L583.5 145.1L575.1 147.8L566.7 150.3L558.5 152.4L550.4 154.3L542.4 155.9L534.4 157.3L526.6 158.4L518.7 159.3L511 160L503.2 160.5L495.6 160.7L487.9 160.8L480.2 160.7L472.6 160.4L464.9 160L457.3 159.4L449.6 158.7L441.9 157.8L434.2 156.8L426.5 155.6L418.8 154.4L411 153L403.2 151.6L395.3 150L387.4 148.4L379.4 146.7L371.4 145L363.4 143.2L355.3 141.4L347.1 139.5L338.8 137.7L330.5 135.8L322.2 134L313.7 132.2L305.2 130.5L296.6 128.7L287.9 127.1L279.1 125.6L270.2 124.1L261.2 122.7L252.2 121.5L243 120.5L233.7 119.5L224.4 118.8L214.9 118.3L205.3 117.9L195.6 117.8L185.8 117.9L175.9 118.3L165.9 119L155.8 119.9L145.7 121.2L135.4 122.7L125 124.6L114.6 126.9L104.1 129.4L93.5 132.4L82.9 135.7L72.2 139.5L61.4 143.6L51.6 148.9L43.1 156.2L36.5 165.3L32.1 175.6L30.1 186.6L30.6 197.8L33.6 208.6L38.9 218.4L46.2 226.9L55.3 233.5L65.6 237.9L76.6 239.9L87.8 239.4Z'
