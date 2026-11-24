import { displayCase } from '../shared/utils'
import en from './en'

type TranslationResolver = (locale: string | undefined) => TranslationsType
export type TranslationsType = {
  am: string
  cancel: string
  chooseMonth: string
  chooseMonthHint: string
  chooseYear: string
  chooseYearHint: string
  close: string
  confirm: string
  dateIsDisabled: string
  endDate: string
  enterDate: string
  enterDates: string
  hour: string
  hourAt: (hour: number) => string
  hourOf: (hour: number, total: number) => string
  inRange: string
  invalidTime: string
  minute: string
  minuteOf: (minute: number, total: number) => string
  mustBeBetween: (startDate: string, endDate: string) => string
  mustBeHigherThan: (date: string) => string
  mustBeLowerThan: (date: string) => string
  next: string
  nextMonth: string
  nextMonthHint: string
  nextYear: string
  nextYearHint: string
  notAccordingToDateFormat: (inputFormat: string) => string
  pickDateFromCalendar: string
  pm: string
  previous: string
  previousMonth: string
  previousMonthHint: string
  previousYear: string
  previousYearHint: string
  save: string
  selectMultiple: string
  selectRange: string
  selectSingle: string
  startDate: string
  today: string
  toggleClock: string
  toggleKeyboard: string
  toggleScroll: string
  typeInDate: string
}

let translationsPerLocale: Record<
  string,
  TranslationsType | TranslationResolver
> = {
  en,
}

function translationTable(locale: string | undefined) {
  const table = translationsPerLocale[locale || 'en']
  if (!table) return undefined
  return typeof table === 'function' ? table(locale) : table
}

export function actionLabels({
  locale,
  saveLabel,
  uppercase,
}: {
  locale?: string
  saveLabel?: string
  uppercase?: boolean
}) {
  return {
    cancelLabel: displayCase(
      getTranslation(locale, 'cancel', 'Cancel'),
      !!uppercase
    ),
    confirmLabel: displayCase(
      saveLabel || getTranslation(locale, 'confirm', 'OK'),
      !!uppercase
    ),
  }
}

export function getTranslation<K extends keyof TranslationsType>(
  locale: string | undefined,
  key: K,
  fallback?: TranslationsType[K]
): TranslationsType[K] {
  const table = translationTable(locale)
  if (!table) {
    console.warn(
      `[react-native-paper-dates] The locale ${locale} is not registered, see https://web-ridge.github.io/react-native-paper-dates/guide/localization, key: ${key}`
    )
    return (fallback || key) as TranslationsType[K]
  }
  const translation = table[key]
  if (!translation) {
    console.warn(
      `[react-native-paper-dates] The locale ${locale} is registered, but ${key} is missing`
    )
  }
  return (translation || fallback || key) as TranslationsType[K]
}

export function registerTranslation(
  locale: string,
  translations: TranslationsType | TranslationResolver
) {
  translationsPerLocale[locale] = translations
}

export function translate(
  locale: string | undefined,
  key: keyof TranslationsType,
  fallback: string
): string {
  const value = getTranslation(locale, key, fallback)
  return typeof value === 'string' && value ? value : fallback
}
