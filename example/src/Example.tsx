import {
  Children,
  isValidElement,
  type ReactNode,
  useMemo,
  useState,
} from 'react'
import {
  Image,
  Linking,
  Pressable,
  type PressableStateCallbackType,
  ScrollView,
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native'
import {
  Button,
  Dialog,
  Divider,
  Icon,
  IconButton,
  RadioButton,
  Searchbar,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { libraryVersion } from './libraryVersion'
import {
  AppText,
  CornerWaves,
  docsBase,
  docsUrl,
  githubUrl,
  SiteFooter,
  useAppStyles,
  wideBreakpoint,
} from './site'

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
const materialDateGuidelinesUrl =
  'https://m3.material.io/components/date-pickers/guidelines'

const materialTimeGuidelinesUrl =
  'https://m3.material.io/components/time-pickers/guidelines'

const dockedDatePickerDocsUrl = `${docsBase}/guide/date-picker/docked-date-picker`

const inputDatePickerDocsUrl = `${docsBase}/guide/date-picker/input-date-picker`

const multipleDatesPickerDocsUrl = `${docsBase}/guide/date-picker/multiple-dates-picker`

const rangeDateInputDocsUrl = `${docsBase}/guide/date-picker/range-date-input`

const rangeDatePickerDocsUrl = `${docsBase}/guide/date-picker/range-date-picker`

const singleDateInputDocsUrl = `${docsBase}/guide/date-picker/single-date-input`

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

export default function Example({
  onToggleTheme,
}: {
  onToggleTheme: () => void
}) {
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
            <View style={styles.headerTop}>
              <View style={[styles.brandRow, !wide && styles.brandRowNarrow]}>
                <Image source={require('./schedule.png')} style={styles.logo} />
                <View style={styles.brandCopy}>
                  <AppText
                    accessibilityHint="Opens the documentation"
                    accessibilityRole="link"
                    onPress={() => Linking.openURL(docsUrl)}
                    style={[styles.title, wide && styles.titleWide]}
                  >
                    {wide
                      ? 'react-native-paper-dates'
                      : 'react-native-\npaper-dates'}
                  </AppText>
                  <AppText style={styles.version}>v{libraryVersion}</AppText>
                </View>
              </View>
              <View style={styles.headerActions}>
                <IconButton
                  accessibilityLabel="GitHub"
                  icon="github"
                  iconColor={theme.colors.primary}
                  mode="outlined"
                  onPress={() => Linking.openURL(githubUrl)}
                  style={styles.themeToggle}
                />
                <IconButton
                  accessibilityLabel={
                    theme.dark
                      ? 'Switch to light theme'
                      : 'Switch to dark theme'
                  }
                  icon={theme.dark ? 'weather-sunny' : 'weather-night'}
                  iconColor={theme.colors.primary}
                  mode="outlined"
                  onPress={onToggleTheme}
                  style={styles.themeToggle}
                />
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
                docsUrl={dockedDatePickerDocsUrl}
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
                docsUrl={singleDateInputDocsUrl}
                icon="calendar-edit"
                onPress={() => setDialog('modalInput')}
                style={wide ? styles.cardFill : undefined}
                title="Single date input"
                value={modalInputLabel}
                wide={wide}
              />
              <DemoCard
                actionLabel="Enter dates"
                docsUrl={rangeDateInputDocsUrl}
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
function formatTime(time: TimeValue, formatter: Intl.DateTimeFormat) {
  if (time.hours === undefined || time.minutes === undefined) {
    return 'No time selected.'
  }
  const timeDate = new Date()
  timeDate.setHours(time.hours, time.minutes, 0, 0)
  return formatter.format(timeDate)
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
type OpenDialog =
  | 'locale'
  | 'modalInput'
  | 'modalInputRange'
  | 'multi'
  | 'range'
  | 'single'
  | 'time'
type TimeValue = {
  hours: number | undefined
  minutes: number | undefined
}
localeCatalog.forEach(({ code, translations }) => {
  registerTranslation(code, translations)
})
