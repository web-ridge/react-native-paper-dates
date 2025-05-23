export type TranslationsType = {
  selectSingle: string
  selectMultiple: string
  selectRange: string
  save: string
  notAccordingToDateFormat: (inputFormat: string) => string
  mustBeHigherThan: (date: string) => string
  mustBeLowerThan: (date: string) => string
  mustBeBetween: (startDate: string, endDate: string) => string
  dateIsDisabled: string
  previous: string
  next: string
  typeInDate: string
  pickDateFromCalendar: string
  close: string
  hour: string
  minute: string
}

export type TranslationResolver = (
  locale: string | undefined
) => TranslationsType

let translationsPerLocale: Record<
  string,
  TranslationsType | TranslationResolver
> = {}

export function getTranslation<K extends keyof TranslationsType>(
  locale: string | undefined,
  key: K,
  fallback?: any
) {
  const l = locale || 'en'
  const translationForLocale = translationsPerLocale[l]
  if (!translationForLocale) {
    console.warn(
      `[react-native-paper-dates] The locale ${locale} is not registered, see README!, key: ${key}`
    )
    return fallback || key
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
  return translation || fallback || key
}

export function registerTranslation(
  locale: string,
  translations: TranslationsType | TranslationResolver
) {
  translationsPerLocale[locale] = translations
}
