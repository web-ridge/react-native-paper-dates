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
}

let translationsPerLocale: Record<string, TranslationsType> = {}

export function getTranslation<K extends keyof TranslationsType>(
  locale: string | undefined,
  key: K,
  fallback?: any
) {
  const l = locale || 'en'
  const translationForLocale = translationsPerLocale[l]
  if (!translationForLocale) {
    console.warn(
      `[react-native-paper-dates] ${locale} is not registered, key: ${key}`
    )
    return fallback || key
  }
  const translation = translationsPerLocale[l][key]
  if (!translationForLocale) {
    console.warn(
      `[react-native-paper-dates] ${locale} is registered, but ${key} is missing`
    )
  }
  return translation || fallback || key
}

export function registerTranslation(
  locale: string,
  translations: TranslationsType
) {
  translationsPerLocale[locale] = translations
}
