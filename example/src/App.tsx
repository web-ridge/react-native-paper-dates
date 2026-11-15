import { StatusBar } from 'expo-status-bar'
import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import {
  type ColorValue,
  Image,
  Linking,
  Platform,
  Pressable,
  type PressableStateCallbackType,
  ScrollView,
  type StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native'
import {
  Button,
  DarkTheme,
  Dialog,
  Divider,
  Icon,
  LightTheme,
  Provider as PaperProvider,
  RadioButton,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper'
import {
  ar,
  ca,
  cs,
  da,
  DatePickerInput,
  DatePickerModal,
  DatePickerModalInput,
  de,
  el,
  en,
  enGB,
  es,
  fi,
  fr,
  he,
  hi,
  id,
  it,
  ja,
  ko,
  nl,
  noNO,
  pl,
  pt,
  registerTranslation,
  ro,
  ru,
  sv,
  th,
  TimePickerModal,
  tr,
  type TranslationsType,
  ukUA,
  zh,
  zhTW,
} from 'react-native-paper-dates'
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { libraryVersion } from './libraryVersion'

export default function App() {
  const [dark, setDark] = useState(true)
  useWebColorScheme(dark)

  return (
    <SafeAreaProvider>
      <PaperProvider theme={dark ? darkTheme : lightTheme}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <Example onToggleTheme={() => setDark((value) => !value)} />
      </PaperProvider>
    </SafeAreaProvider>
  )
}

function useWebColorScheme(dark: boolean) {
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

function AppText(props: ComponentProps<typeof Text>) {
  return <Text {...props} maxFontSizeMultiplier={maxFontSizeMultiplier} />
}

function CornerWaves({ wide }: WideProps) {
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
    authorLink: {
      color: colors.primary,
      fontSize: 12,
      lineHeight: 16,
    },
    authors: {
      color: colors.onSurfaceVariant,
      fontSize: 12,
      lineHeight: 16,
    },
    brandCopy: {
      flex: 1,
      gap: 4,
      justifyContent: 'center',
    },
    brandRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 14,
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
    docsButton: {
      flexGrow: 1,
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
      flexWrap: 'wrap',
      gap: 10,
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

const darkTheme = {
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

type DateRange = {
  endDate: Date | undefined
  startDate: Date | undefined
}

function daysFromToday(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

function DemoCard({
  actionLabel,
  children,
  docsUrl: cardDocsUrl,
  icon,
  onPress,
  style,
  title,
  value,
  wide,
}: DemoCardProps) {
  const styles = useAppStyles()
  const theme = useTheme()
  const control = (
    <>
      {children}
      {actionLabel ? (
        <Button
          buttonColor={theme.colors.primaryContainer}
          mode="filled"
          onPress={onPress}
          style={wide ? styles.actionButtonCompact : styles.actionButton}
          textColor={theme.colors.onPrimaryContainer}
        >
          {actionLabel}
        </Button>
      ) : null}
    </>
  )

  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Icon color={theme.colors.primary} size={22} source={icon} />
        <View style={styles.cardCopy}>
          <AppText style={styles.cardTitle} variant="titleMedium">
            {title}
          </AppText>
          <AppText
            ellipsizeMode="tail"
            numberOfLines={2}
            style={styles.cardValue}
            variant="bodyMedium"
          >
            {value}
          </AppText>
        </View>
        {cardDocsUrl ? (
          <Pressable
            accessibilityLabel={`Documentation for ${title}`}
            accessibilityRole="link"
            hitSlop={8}
            onPress={() => Linking.openURL(cardDocsUrl)}
          >
            {(state: PressableStateCallbackType & { hovered?: boolean }) => (
              <View style={styles.cardDocsLink}>
                <AppText
                  style={[
                    styles.cardDocsLinkText,
                    (state.hovered || state.pressed) &&
                      styles.cardDocsLinkTextActive,
                  ]}
                >
                  Docs
                </AppText>
                <Icon
                  color={theme.colors.primary}
                  size={16}
                  source="open-in-new"
                />
              </View>
            )}
          </Pressable>
        ) : null}
      </View>
      <View style={styles.cardFooter}>{control}</View>
    </View>
  )
}

type DemoCardProps = {
  actionLabel?: string
  children?: ReactNode
  docsUrl?: string
  icon: string
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  title: string
  value: string
  wide?: boolean
}

const docsBase = 'https://web-ridge.github.io/react-native-paper-dates'

const docsUrl = `${docsBase}/`

const materialDateGuidelinesUrl =
  'https://m3.material.io/components/date-pickers/guidelines'

const materialTimeGuidelinesUrl =
  'https://m3.material.io/components/time-pickers/guidelines'

const inputDatePickerDocsUrl = `${docsBase}/guide/date-picker/input-date-picker`

const multipleDatesPickerDocsUrl = `${docsBase}/guide/date-picker/multiple-dates-picker`

const rangeDatePickerDocsUrl = `${docsBase}/guide/date-picker/range-date-picker`

const singleDatePickerDocsUrl = `${docsBase}/guide/date-picker/single-date-picker`

const timePickerDocsUrl = `${docsBase}/guide/time-picker`

function ExampleSection({
  children,
  description,
  guidelineUrl,
  title,
  wide,
}: ExampleSectionProps) {
  const styles = useAppStyles()
  const theme = useTheme()
  const cards = Children.toArray(children)

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <AppText
            accessibilityRole="header"
            style={styles.sectionTitle}
            variant="titleLarge"
          >
            {title}
          </AppText>
          {guidelineUrl ? (
            <Pressable
              accessibilityLabel={`Material guidelines for ${title}`}
              accessibilityRole="link"
              onPress={() => Linking.openURL(guidelineUrl)}
            >
              {(state: PressableStateCallbackType & { hovered?: boolean }) => (
                <View style={styles.guidelineLink}>
                  <AppText
                    style={[
                      styles.guidelineLinkText,
                      (state.hovered || state.pressed) &&
                        styles.guidelineLinkTextActive,
                    ]}
                  >
                    Material guidelines
                  </AppText>
                  <Icon
                    color={theme.colors.primary}
                    size={16}
                    source="open-in-new"
                  />
                </View>
              )}
            </Pressable>
          ) : (
            <AppText style={styles.libraryNote}>Unique to this library</AppText>
          )}
        </View>
        <AppText style={styles.sectionCopy}>{description}</AppText>
      </View>
      <View style={wide ? styles.sectionRow : styles.stack}>
        {cards.map((card) => (
          <View
            key={isValidElement(card) ? String(card.key) : undefined}
            style={wide ? styles.sectionCell : undefined}
          >
            {card}
          </View>
        ))}
        {wide && cards.length === 1 ? (
          <View style={styles.sectionCell} />
        ) : null}
      </View>
    </View>
  )
}

type ExampleSectionProps = {
  children: ReactNode
  description: string
  guidelineUrl?: string
  title: string
  wide: boolean
}

function Example({ onToggleTheme }: { onToggleTheme: () => void }) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [dockedDate, setDockedDate] = useState<Date | undefined>(undefined)
  const [dates, setDates] = useState<Date[] | undefined>()
  const [dialog, setDialog] = useState<OpenDialog | null>(null)
  const futureDate = daysFromToday(5)
  const { height, width } = useWindowDimensions()
  const [inputDate, setInputDate] = useState<Date | undefined>(undefined)
  const [modalInputDate, setModalInputDate] = useState<Date | undefined>(
    undefined
  )
  const [modalInputRange, setModalInputRange] = useState<DateRange>({
    endDate: undefined,
    startDate: undefined,
  })
  const insets = useSafeAreaInsets()
  const [locale, setLocale] = useState('en-GB')
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [locale]
  )
  const formatDate = (value: Date | undefined, empty = 'No date selected.') =>
    value ? dateFormatter.format(value) : empty
  const dockedLabel = formatDate(dockedDate)
  const inputLabel = formatDate(inputDate)
  const modalInputLabel = formatDate(modalInputDate)
  const modalInputRangeLabel =
    modalInputRange.startDate || modalInputRange.endDate
      ? `${formatDate(modalInputRange.startDate, '')} - ${formatDate(modalInputRange.endDate, '')}`
      : 'No dates selected.'
  const localeListMaxHeight = Math.min(
    420,
    Math.max(120, height - insets.top - insets.bottom - 248)
  )
  const [localeQuery, setLocaleQuery] = useState('')
  const closeDialog = () => {
    setDialog(null)
    setLocaleQuery('')
  }
  const filteredLocales = useMemo(() => {
    const query = localeQuery.trim().toLowerCase()
    if (!query) {
      return localeCatalog
    }
    return localeCatalog.filter(({ code }) =>
      localeLabel(code).toLowerCase().includes(query)
    )
  }, [localeQuery])
  const multiLabel = dates?.length
    ? dates.map((value) => dateFormatter.format(value)).join(', ')
    : 'No dates selected.'
  const pastDate = daysFromToday(-5)
  const [range, setRange] = useState<DateRange>({
    endDate: undefined,
    startDate: undefined,
  })
  const rangeLabel =
    range.startDate || range.endDate
      ? `${formatDate(range.startDate, '')} - ${formatDate(range.endDate, '')}`
      : 'No dates selected.'
  const [time, setTime] = useState<TimeValue>({
    hours: undefined,
    minutes: undefined,
  })
  const singleLabel = formatDate(date)
  const styles = useAppStyles()
  const theme = useTheme()
  const inputIconColor =
    typeof theme.colors.onSurfaceVariant === 'string'
      ? theme.colors.onSurfaceVariant
      : undefined
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        hour12: locale === 'en',
        minute: '2-digit',
      }),
    [locale]
  )
  const timeLabel = formatTime(time, timeFormatter)
  const wide = width >= wideBreakpoint

  return (
    <View style={styles.screen}>
      <CornerWaves wide={wide} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          wide && styles.scrollContentWide,
          { paddingBottom: insets.bottom + 28, paddingTop: insets.top + 20 },
        ]}
      >
        <View style={[styles.page, wide && styles.pageWide]}>
          <View style={styles.header}>
            <View style={[styles.brandRow, !wide && styles.brandRowNarrow]}>
              <Image source={require('./schedule.png')} style={styles.logo} />
              <View style={styles.brandCopy}>
                <AppText
                  onPress={() => Linking.openURL(githubUrl)}
                  style={[styles.title, wide && styles.titleWide]}
                >
                  {wide
                    ? 'react-native-paper-dates'
                    : 'react-native-\npaper-dates'}
                </AppText>
                <AppText style={styles.version}>v{libraryVersion}</AppText>
                <AppText style={styles.authors}>
                  Authors:{' '}
                  <AppText
                    onPress={() =>
                      Linking.openURL('https://twitter.com/RichardLindhout')
                    }
                    style={styles.authorLink}
                  >
                    Richard Lindhout
                  </AppText>
                  ,{' '}
                  <AppText
                    onPress={() =>
                      Linking.openURL('https://github.com/iM-GeeKy')
                    }
                    style={styles.authorLink}
                  >
                    Brandon Fitzwater
                  </AppText>
                </AppText>
              </View>
            </View>
            <AppText style={styles.description}>
              Cross-platform Material Design{' '}
              <AppText
                accessibilityRole="link"
                onPress={() =>
                  Linking.openURL(
                    'https://m3.material.io/components/date-pickers/overview'
                  )
                }
                style={styles.descriptionLink}
              >
                date pickers
              </AppText>{' '}
              and{' '}
              <AppText
                accessibilityRole="link"
                onPress={() =>
                  Linking.openURL(
                    'https://m3.material.io/components/time-pickers/overview'
                  )
                }
                style={styles.descriptionLink}
              >
                time pickers
              </AppText>{' '}
              for React Native Paper.
            </AppText>
            <View style={styles.headerActions}>
              <Button
                accessibilityLabel={
                  theme.dark ? 'Switch to light theme' : 'Switch to dark theme'
                }
                icon={theme.dark ? 'weather-sunny' : 'weather-night'}
                mode="outlined"
                onPress={onToggleTheme}
                textColor={theme.colors.primary}
              >
                {theme.dark ? 'Light theme' : 'Dark theme'}
              </Button>
              <Button
                buttonColor={theme.colors.secondaryContainer}
                icon="github"
                mode="filled"
                onPress={() => Linking.openURL(githubUrl)}
                textColor={theme.colors.onSecondaryContainer}
              >
                GitHub
              </Button>
              <Button
                buttonColor={theme.colors.primary}
                icon="file-document-outline"
                mode="filled"
                onPress={() => Linking.openURL(docsUrl)}
                style={wide ? undefined : styles.docsButton}
                textColor={theme.colors.onPrimary}
              >
                View documentation
              </Button>
            </View>
          </View>

          <View style={[styles.localeBar, wide && styles.localeBarWide]}>
            <Pressable
              accessibilityHint="Opens a list of locales"
              accessibilityLabel={`Locale ${localeLabel(locale)}`}
              accessibilityRole="button"
              accessibilityState={{ expanded: dialog === 'locale' }}
              onPress={() => setDialog('locale')}
              style={styles.localeTrigger}
            >
              <Icon color={theme.colors.primary} size={18} source="web" />
              <View style={styles.localeValueBlock}>
                <AppText style={styles.localeOverline}>Locale</AppText>
                <AppText
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={styles.localeValue}
                >
                  {localeCompactLabel(locale)}
                </AppText>
              </View>
              <Icon
                color={theme.colors.onSurface}
                size={18}
                source="chevron-down"
              />
            </Pressable>
            <Dialog
              onDismiss={closeDialog}
              style={styles.localeDialog}
              visible={dialog === 'locale'}
            >
              <Dialog.Title>Locale</Dialog.Title>
              <Searchbar
                inputStyle={styles.searchInput}
                onChangeText={setLocaleQuery}
                placeholder="Search locales"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                style={styles.searchbar}
                theme={{
                  colors: {
                    surfaceContainerHigh: theme.colors.secondaryContainer,
                  },
                }}
                value={localeQuery}
              />
              <Dialog.ScrollArea
                style={[
                  styles.localeScroll,
                  { maxHeight: localeListMaxHeight },
                ]}
              >
                <ScrollView keyboardShouldPersistTaps="handled">
                  {filteredLocales.length === 0 ? (
                    <AppText style={styles.emptyLocales} variant="bodyMedium">
                      No locales match.
                    </AppText>
                  ) : (
                    <RadioButton.Group
                      onValueChange={(code) => {
                        setLocale(code)
                        // Close after this press ends. Unmounting the dialog
                        // mid-click lets the release land on the trigger and
                        // reopen it.
                        setTimeout(closeDialog, 0)
                      }}
                      value={locale}
                    >
                      {filteredLocales.map(({ code }) => (
                        <RadioButton.Item
                          key={code}
                          label={localeLabel(code)}
                          style={styles.localeOption}
                          value={code}
                        />
                      ))}
                    </RadioButton.Group>
                  )}
                </ScrollView>
              </Dialog.ScrollArea>
              <Dialog.Actions>
                <Button onPress={closeDialog}>Close</Button>
              </Dialog.Actions>
            </Dialog>
          </View>

          <View style={[styles.examples, wide && styles.examplesWide]}>
            <ExampleSection
              description="Type a date in the field. The calendar opens beneath it, or full screen on a small display."
              guidelineUrl={materialDateGuidelinesUrl}
              title="Docked date picker"
              wide={wide}
            >
              <DemoCard
                docsUrl={inputDatePickerDocsUrl}
                icon="calendar-month-outline"
                style={wide ? styles.cardFill : undefined}
                title="Date input"
                value={inputLabel}
                wide={wide}
              >
                <DatePickerInput
                  autoComplete="birthdate-full"
                  iconColor={inputIconColor}
                  inputMode="start"
                  locale={locale}
                  onChange={setInputDate}
                  style={styles.dateInput}
                  theme={{ colors: { background: theme.colors.surface } }}
                  value={inputDate}
                  variant="outlined"
                />
              </DemoCard>
              <DemoCard
                docsUrl={inputDatePickerDocsUrl}
                icon="calendar-cursor"
                style={wide ? styles.cardFill : undefined}
                title="Docked date"
                value={dockedLabel}
                wide={wide}
              >
                <DatePickerInput
                  iconColor={inputIconColor}
                  inputMode="start"
                  locale={locale}
                  onChange={setDockedDate}
                  presentation="docked"
                  style={styles.dateInput}
                  theme={{ colors: { background: theme.colors.surface } }}
                  value={dockedDate}
                  variant="outlined"
                />
              </DemoCard>
            </ExampleSection>
            <ExampleSection
              description="Select one date, or a start and end date, from a calendar dialog."
              guidelineUrl={materialDateGuidelinesUrl}
              title="Modal date picker"
              wide={wide}
            >
              <DemoCard
                actionLabel="Pick single date"
                docsUrl={singleDatePickerDocsUrl}
                icon="calendar-check-outline"
                onPress={() => setDialog('single')}
                style={wide ? styles.cardFill : undefined}
                title="Single date"
                value={singleLabel}
                wide={wide}
              />
              <DemoCard
                actionLabel="Pick range"
                docsUrl={rangeDatePickerDocsUrl}
                icon="calendar-plus"
                onPress={() => setDialog('range')}
                style={wide ? styles.cardFill : undefined}
                title="Date range"
                value={rangeLabel}
                wide={wide}
              />
            </ExampleSection>
            <ExampleSection
              description="Enter a date or a range with the keyboard when a calendar is not needed first."
              guidelineUrl={materialDateGuidelinesUrl}
              title="Modal date input"
              wide={wide}
            >
              <DemoCard
                actionLabel="Enter date"
                docsUrl={singleDatePickerDocsUrl}
                icon="calendar-edit"
                onPress={() => setDialog('modalInput')}
                style={wide ? styles.cardFill : undefined}
                title="Single date input"
                value={modalInputLabel}
                wide={wide}
              />
              <DemoCard
                actionLabel="Enter dates"
                docsUrl={rangeDatePickerDocsUrl}
                icon="calendar-range"
                onPress={() => setDialog('modalInputRange')}
                style={wide ? styles.cardFill : undefined}
                title="Date range input"
                value={modalInputRangeLabel}
                wide={wide}
              />
            </ExampleSection>
            <ExampleSection
              description="Select any number of individual dates from the calendar."
              title="Multiple dates"
              wide={wide}
            >
              <DemoCard
                actionLabel="Pick multiple dates"
                docsUrl={multipleDatesPickerDocsUrl}
                icon="calendar-multiple"
                onPress={() => setDialog('multi')}
                style={wide ? styles.cardFill : undefined}
                title="Multiple dates"
                value={multiLabel}
                wide={wide}
              />
            </ExampleSection>
            <ExampleSection
              description="Set a time on the dial, or type the hours and minutes."
              guidelineUrl={materialTimeGuidelinesUrl}
              title="Time picker"
              wide={wide}
            >
              <DemoCard
                actionLabel="Pick time"
                docsUrl={timePickerDocsUrl}
                icon="clock-outline"
                onPress={() => setDialog('time')}
                style={wide ? styles.cardFill : undefined}
                title="Time"
                value={timeLabel}
                wide={wide}
              />
            </ExampleSection>
          </View>

          <Divider style={styles.divider} />
          <SiteFooter wide={wide} />
        </View>
      </ScrollView>
      <DatePickerModal
        endDate={range.endDate}
        locale={locale}
        mode="range"
        onConfirm={({ endDate, startDate }) => {
          closeDialog()
          setRange({ endDate, startDate })
        }}
        onDismiss={closeDialog}
        startDate={range.startDate}
        visible={dialog === 'range'}
      />
      <DatePickerModal
        date={date}
        locale={locale}
        mode="single"
        onConfirm={({ date: nextDate }) => {
          closeDialog()
          setDate(nextDate)
        }}
        onDismiss={closeDialog}
        validRange={{
          disabledDates: [futureDate],
          startDate: pastDate,
        }}
        visible={dialog === 'single'}
      />
      <DatePickerModal
        dates={dates}
        locale={locale}
        mode="multiple"
        onConfirm={({ dates: nextDates }) => {
          closeDialog()
          setDates(nextDates)
        }}
        onDismiss={closeDialog}
        validRange={{ startDate: new Date() }}
        visible={dialog === 'multi'}
      />
      <DatePickerModalInput
        date={modalInputDate}
        locale={locale}
        mode="single"
        onConfirm={({ date: nextDate }) => {
          closeDialog()
          setModalInputDate(nextDate)
        }}
        onDismiss={closeDialog}
        visible={dialog === 'modalInput'}
      />
      <DatePickerModalInput
        endDate={modalInputRange.endDate}
        locale={locale}
        mode="range"
        onConfirm={({ endDate, startDate }) => {
          closeDialog()
          setModalInputRange({ endDate, startDate })
        }}
        onDismiss={closeDialog}
        startDate={modalInputRange.startDate}
        visible={dialog === 'modalInputRange'}
      />
      <TimePickerModal
        hours={time.hours}
        locale={locale}
        minutes={time.minutes}
        onConfirm={({ hours, minutes }) => {
          closeDialog()
          setTime({ hours, minutes })
        }}
        onDismiss={closeDialog}
        visible={dialog === 'time'}
      />
    </View>
  )
}

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

function formatTime(time: TimeValue, formatter: Intl.DateTimeFormat) {
  if (time.hours === undefined || time.minutes === undefined) {
    return 'No time selected.'
  }
  const timeDate = new Date()
  timeDate.setHours(time.hours, time.minutes, 0, 0)
  return formatter.format(timeDate)
}

const githubUrl = 'https://github.com/web-ridge/react-native-paper-dates'

const lightTheme = {
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

function localeByCode(code: string) {
  return localeCatalog.find((locale) => locale.code === code)
}

function localeCompactLabel(code: string) {
  const locale = localeByCode(code)
  if (!locale) {
    return code
  }
  if (locale.native) {
    return `${code} \u00b7 \u2068${locale.native}\u2069`
  }
  return `${code} — ${locale.english}`
}

function localeLabel(code: string) {
  const locale = localeByCode(code)
  if (!locale) {
    return code
  }
  if (
    locale.native &&
    locale.native.localeCompare(locale.english, undefined, {
      sensitivity: 'accent',
    }) !== 0
  ) {
    return `${code} — ${locale.english} \u00b7 \u2068${locale.native}\u2069`
  }
  return `${code} — ${locale.english}`
}

type LocaleOption = {
  code: string
  english: string
  native?: string
  translations: TranslationsType
}

const localeCatalog: LocaleOption[] = [
  {
    code: 'ar',
    english: 'Arabic',
    native: 'العربية',
    translations: ar,
  },
  {
    code: 'ca',
    english: 'Catalan',
    native: 'català',
    translations: ca,
  },
  {
    code: 'cs',
    english: 'Czech',
    native: 'čeština',
    translations: cs,
  },
  {
    code: 'da',
    english: 'Danish',
    native: 'dansk',
    translations: da,
  },
  {
    code: 'de',
    english: 'German',
    native: 'Deutsch',
    translations: de,
  },
  {
    code: 'el',
    english: 'Greek',
    native: 'Ελληνικά',
    translations: el,
  },
  { code: 'en', english: 'English', translations: en },
  {
    code: 'en-GB',
    english: 'English (United Kingdom)',
    translations: enGB,
  },
  {
    code: 'es',
    english: 'Spanish',
    native: 'español',
    translations: es,
  },
  {
    code: 'fi',
    english: 'Finnish',
    native: 'suomi',
    translations: fi,
  },
  {
    code: 'fr',
    english: 'French',
    native: 'français',
    translations: fr,
  },
  {
    code: 'he',
    english: 'Hebrew',
    native: 'עברית',
    translations: he,
  },
  {
    code: 'hi',
    english: 'Hindi',
    native: 'हिन्दी',
    translations: hi,
  },
  {
    code: 'id',
    english: 'Indonesian',
    native: 'Indonesia',
    translations: id,
  },
  {
    code: 'it',
    english: 'Italian',
    native: 'italiano',
    translations: it,
  },
  {
    code: 'ja',
    english: 'Japanese',
    native: '日本語',
    translations: ja,
  },
  {
    code: 'ko',
    english: 'Korean',
    native: '한국어',
    translations: ko,
  },
  {
    code: 'nl',
    english: 'Dutch',
    native: 'Nederlands',
    translations: nl,
  },
  {
    code: 'no-NO',
    english: 'Norwegian',
    native: 'norsk',
    translations: noNO,
  },
  {
    code: 'pl',
    english: 'Polish',
    native: 'polski',
    translations: pl,
  },
  {
    code: 'pt',
    english: 'Portuguese',
    native: 'português',
    translations: pt,
  },
  {
    code: 'ro',
    english: 'Romanian',
    native: 'română',
    translations: ro,
  },
  {
    code: 'ru',
    english: 'Russian',
    native: 'русский',
    translations: ru,
  },
  {
    code: 'sv',
    english: 'Swedish',
    native: 'svenska',
    translations: sv,
  },
  {
    code: 'th',
    english: 'Thai',
    native: 'ไทย',
    translations: th,
  },
  {
    code: 'tr',
    english: 'Turkish',
    native: 'Türkçe',
    translations: tr,
  },
  {
    code: 'uk-UA',
    english: 'Ukrainian',
    native: 'українська',
    translations: ukUA,
  },
  {
    code: 'zh',
    english: 'Chinese',
    native: '中文',
    translations: zh,
  },
  {
    code: 'zh-TW',
    english: 'Chinese (Taiwan)',
    native: '中文（台灣）',
    translations: zhTW,
  },
]

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

type OpenDialog =
  | 'locale'
  | 'modalInput'
  | 'modalInputRange'
  | 'multi'
  | 'range'
  | 'single'
  | 'time'

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

function SiteFooter({ wide }: WideProps) {
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

type TimeValue = {
  hours: number | undefined
  minutes: number | undefined
}

function useAppStyles() {
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

localeCatalog.forEach(({ code, translations }) => {
  registerTranslation(code, translations)
})

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
const wideBreakpoint = 960
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
