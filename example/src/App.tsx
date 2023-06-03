import * as React from 'react'
import { StyleSheet, ScrollView, View, Linking, Image } from 'react-native'
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'
import {
  Button,
  Text,
  Provider as PaperProvider,
  useTheme,
  Paragraph,
  List,
  Divider,
  Chip,
  MD2Theme,
  MD3Theme,
} from 'react-native-paper'
import {
  DatePickerModal,
  TimePickerModal,
  DatePickerInput,
  // @ts-ignore TODO: try to fix expo to work with local library
} from 'react-native-paper-dates'
import { useCallback, useEffect, useState } from 'react'
import {
  ar,
  de,
  en,
  enGB,
  fr,
  he,
  hi,
  ko,
  nl,
  pl,
  pt,
  registerTranslation,
  tr,
} from '../../src'

function App() {
  /** Hooks. */
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  /** State variables. */
  const [inputDate, setInputDate] = useState<Date | undefined>(undefined)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [dates, setDates] = useState<Date[] | undefined>()
  const [range, setRange] = useState<{
    startDate: Date | undefined
    endDate: Date | undefined
  }>({ startDate: undefined, endDate: undefined })
  const [time, setTime] = useState<{
    hours: number | undefined
    minutes: number | undefined
  }>({ hours: undefined, minutes: undefined })
  const [locale, setLocale] = useState('en-GB')
  const [timeOpen, setTimeOpen] = useState(false)
  const [rangeOpen, setRangeOpen] = useState(false)
  const [singleOpen, setSingleOpen] = useState(false)
  const [multiOpen, setMultiOpen] = useState(false)

  /** Constants. */
  const maxFontSizeMultiplier = 1.5
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const pastDate = new Date(new Date().setDate(new Date().getDate() - 5))
  const futureDate = new Date(new Date().setDate(new Date().getDate() + 5))
  const locales = [
    'en',
    'nl',
    'de',
    'pl',
    'pt',
    'ar',
    'ko',
    'fr',
    'he',
    'hi',
    'tr',
    'en-GB',
  ]
  let timeDate = new Date()
  time.hours !== undefined && timeDate.setHours(time.hours)
  time.minutes !== undefined && timeDate.setMinutes(time.minutes)

  /** Use effects. */
  useEffect(() => {
    registerTranslation(locale, getImportTranslation(locale))
  }, [locale])

  /** Callbacks. */
  const onConfirmTime = useCallback(
    ({ hours, minutes }: any) => {
      setTimeOpen(false)
      setTime({ hours, minutes })
    },
    [setTimeOpen, setTime]
  )
  const onDismissTime = useCallback(() => {
    setTimeOpen(false)
  }, [setTimeOpen])

  const onChangeSingle = useCallback(
    (params: any) => {
      setSingleOpen(false)
      setDate(params.date)
    },
    [setSingleOpen, setDate]
  )
  const onDismissSingle = useCallback(() => {
    setSingleOpen(false)
  }, [setSingleOpen])

  const onChangeMulti = useCallback((params: any) => {
    setMultiOpen(false)
    setDates(params.dates)
  }, [])
  const onDismissMulti = useCallback(() => {
    setMultiOpen(false)
  }, [])

  const onChangeRange = useCallback(
    ({ startDate, endDate }: any) => {
      setRangeOpen(false)
      setRange({ startDate, endDate })
    },
    [setRangeOpen, setRange]
  )
  const onDismissRange = useCallback(() => {
    setRangeOpen(false)
  }, [setRangeOpen])

  /** Functions. */
  const getImportTranslation = (currentLocale: string) => {
    switch (currentLocale) {
      case 'ar':
        return ar
      case 'en':
        return en
      case 'de':
        return de
      case 'fr':
        return fr
      case 'he':
        return he
      case 'hi':
        return hi
      case 'ko':
        return ko
      case 'nl':
        return nl
      case 'pl':
        return pl
      case 'pt':
        return pt
      case 'tr':
        return tr
      default:
        return enGB
    }
  }

  return (
    <>
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={[
          styles.paddingSixteen,
          { paddingTop: insets.top },
        ]}
      >
        <View style={styles.row}>
          <Image source={require('./schedule.png')} style={styles.logo} />
          <View style={styles.column}>
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              onPress={() =>
                Linking.openURL(
                  'https://github.com/web-ridge/react-native-paper-dates'
                )
              }
              style={{ color: theme.colors.primary }}
              variant="titleLarge"
            >
              react-native-paper-dates
            </Text>
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              variant="bodySmall"
            >
              Authors:{' '}
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                onPress={() =>
                  Linking.openURL('https://twitter.com/RichardLindhout')
                }
                style={{ color: theme.colors.secondary }}
                variant="bodySmall"
              >
                Richard Lindhout
              </Text>
              ,{' '}
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                onPress={() => Linking.openURL('https://github.com/iM-GeeKy')}
                style={{ color: theme.colors.secondary }}
                variant="bodySmall"
              >
                Brandon Fitzwater
              </Text>
            </Text>
          </View>
        </View>
        <Paragraph
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={styles.marginBottomEight}
        >
          Smooth and fast cross platform Material Design date picker for React
          Native Paper brought to you by{' '}
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            onPress={() => Linking.openURL('https://webridge.nl')}
            style={[styles.underline, { color: theme.colors.secondary }]}
          >
            webRidge
          </Text>
          . For more information check out the official{' '}
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            onPress={() =>
              Linking.openURL(
                'https://web-ridge.github.io/react-native-paper-dates/'
              )
            }
            style={[styles.underline, { color: theme.colors.secondary }]}
          >
            documentation
          </Text>
          .
        </Paragraph>
        <Divider style={styles.marginVerticalEight} />
        <Text
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[styles.marginVerticalEight, styles.bold]}
        >
          Locale
        </Text>
        <View style={styles.chipContainer}>
          {locales.map((option) => {
            return (
              <Chip
                compact
                key={option}
                selected={locale === option}
                onPress={() => setLocale(option)}
                style={styles.chip}
              >
                {option}
              </Chip>
            )
          })}
        </View>
        <Divider style={styles.marginTopSixteen} />
        <List.Section>
          <View style={[styles.row, styles.marginVerticalEight]}>
            <View style={styles.section}>
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                style={styles.bold}
              >
                Time Picker
              </Text>
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                variant="bodySmall"
              >
                {time && time.hours !== undefined && time.minutes !== undefined
                  ? timeFormatter.format(timeDate)
                  : 'No time selected.'}
              </Text>
            </View>
            <Button
              onPress={() => setTimeOpen(true)}
              uppercase={false}
              mode="outlined"
              compact
            >
              Pick time
            </Button>
          </View>
          <Divider style={styles.marginVerticalEight} />
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[styles.marginTopEight, styles.bold]}
          >
            Date Picker
          </Text>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[styles.marginTopSixteen, styles.marginBottomEight]}
          >
            Input
          </Text>
          <DatePickerInput
            locale={locale}
            value={inputDate}
            onChange={setInputDate}
            inputMode="start"
            autoComplete={'birthdate-full'}
            style={styles.marginBottomEight}
          />
          <View style={styles.sectionContainer}>
            <View style={styles.section}>
              <Text maxFontSizeMultiplier={maxFontSizeMultiplier}>
                Single Date
              </Text>
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                variant="bodySmall"
              >
                {date ? dateFormatter.format(date) : 'No date selected.'}
              </Text>
            </View>
            <Button
              onPress={() => setSingleOpen(true)}
              uppercase={false}
              mode="outlined"
              compact
            >
              Pick single date
            </Button>
          </View>
          <View style={styles.sectionContainer}>
            <View style={styles.section}>
              <Text maxFontSizeMultiplier={maxFontSizeMultiplier}>
                Multiple Dates
              </Text>
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                variant="bodySmall"
              >
                {dates
                  ?.map((d) => dateFormatter.format(d))
                  .filter(Boolean)
                  .join(', ') || 'No dates selected.'}
              </Text>
            </View>
            <Button
              onPress={() => setMultiOpen(true)}
              uppercase={false}
              mode="outlined"
              compact
            >
              Pick multiple dates
            </Button>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.section}>
              <Text maxFontSizeMultiplier={maxFontSizeMultiplier}>
                Date Range
              </Text>
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                variant="bodySmall"
              >
                {!range.startDate && !range.endDate
                  ? 'No dates selected.'
                  : [
                      range.startDate
                        ? dateFormatter.format(range.startDate)
                        : '',
                      range.endDate ? dateFormatter.format(range.endDate) : '',
                    ].join(' - ')}
              </Text>
            </View>
            <Button
              onPress={() => setRangeOpen(true)}
              uppercase={false}
              mode="outlined"
              compact
            >
              Pick range
            </Button>
          </View>
        </List.Section>
      </ScrollView>
      <DatePickerModal
        locale={locale}
        mode="range"
        visible={rangeOpen}
        onDismiss={onDismissRange}
        startDate={range.startDate}
        endDate={range.endDate}
        onConfirm={onChangeRange}
      />
      <DatePickerModal
        locale={locale}
        mode="single"
        visible={singleOpen}
        onDismiss={onDismissSingle}
        date={date}
        onConfirm={onChangeSingle}
        validRange={{
          startDate: pastDate,
          disabledDates: [futureDate],
        }}
      />
      <DatePickerModal
        locale={locale}
        mode="multiple"
        visible={multiOpen}
        onDismiss={onDismissMulti}
        dates={dates}
        validRange={{ startDate: new Date() }}
        onConfirm={onChangeMulti}
      />
      <TimePickerModal
        locale={locale}
        visible={timeOpen}
        onDismiss={onDismissTime}
        onConfirm={onConfirmTime}
        hours={time.hours}
        minutes={time.minutes}
      />
    </>
  )
}

const theme: MD2Theme | MD3Theme = { version: 3 } as MD2Theme | MD3Theme
export default function AppWithProviders() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <App />
      </PaperProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
  column: {
    flexDirection: 'column',
  },
  chip: {
    marginHorizontal: 4,
    marginVertical: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  logo: {
    height: 56,
    marginRight: 12,
    width: 56,
  },
  paddingSixteen: {
    padding: 16,
  },
  marginBottomEight: {
    marginBottom: 8,
  },
  marginTopEight: {
    marginTop: 8,
  },
  marginTopSixteen: {
    marginTop: 16,
  },
  marginVerticalEight: {
    marginVertical: 8,
  },
  marginVerticalSixteen: {
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
  },
  section: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  sectionContainer: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  underline: {
    textDecorationLine: 'underline',
  },
})
