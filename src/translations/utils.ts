export type TranslationsType = {
  am: string
  close: string
  dateIsDisabled: string
  hour: string
  minute: string
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
