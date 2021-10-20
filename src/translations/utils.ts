export type TranslationsType = {
  selectSingle: string
  selectMultiple: string
  selectRange: string
  save: string
  notAccordingToDateFormat: (inputFormat: string) => string
  mustBeHigherThan: string
  mustBeLowerThan: string
  mustBeBetween: string
  dateIsDisabled: string
}

let translationsPerLocale: Record<string, TranslationsType> = {}

export function getTranslation(
  locale: string | undefined,
  key: keyof TranslationsType,
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
