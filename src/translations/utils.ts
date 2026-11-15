export function getTranslation<K extends keyof TranslationsType>(
  locale: string | undefined,
  key: K,
  fallback?: TranslationsType[K]
): TranslationsType[K] {
  const l = locale || 'en'
  const translationForLocale = translationsPerLocale[l]
  if (!translationForLocale) {
    console.warn(
      `[react-native-paper-dates] The locale ${locale} is not registered, see README!, key: ${key}`
    )
    return (fallback || key) as TranslationsType[K]
  }
  const translation: TranslationsType[K] =
    typeof translationForLocale === 'function'
      ? translationForLocale(locale)[key]
      : translationForLocale[key]
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
  const l = locale || 'en'
  const translationForLocale = translationsPerLocale[l]
  if (!translationForLocale) return fallback
  const table =
    typeof translationForLocale === 'function'
      ? translationForLocale(locale)
      : translationForLocale
  const value = table[key]
  return typeof value === 'string' && value ? value : fallback
}

export type TranslationsType = {
  am: string
  cancel?: string
  close: string
  confirm?: string
  dateIsDisabled: string
  enterDate?: string
  enterDates?: string
  hour: string
  hourOf: (hour: number, total: number) => string
  minute: string
  minuteOf: (minute: number, total: number) => string
  mustBeBetween: (startDate: string, endDate: string) => string
  mustBeHigherThan: (date: string) => string
  mustBeLowerThan: (date: string) => string
  next: string
  notAccordingToDateFormat: (inputFormat: string) => string
  pickDateFromCalendar: string
  pm: string
  previous: string
  save: string
  selectMultiple: string
  selectRange: string
  selectSingle: string
  toggleClock: string
  toggleKeyboard: string
  typeInDate: string
}

export type TranslationResolver = (
  locale: string | undefined
) => TranslationsType

let translationsPerLocale: Record<
  string,
  TranslationsType | TranslationResolver
> = {}
