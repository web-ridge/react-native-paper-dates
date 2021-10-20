export type TranslationsType = {
  selectSingle: string
  selectMultiple: string
  selectRange: string
  save: string
}

let translationsPerLocale: Record<string, TranslationsType> = {}

export function getTranslation(
  locale: string | undefined,
  key: keyof TranslationsType
) {
  const l = locale || 'en'
  const translationForLocale = translationsPerLocale[l]
  if (!translationForLocale) {
    console.warn(
      `[react-native-paper-dates] ${locale} is not registered, key: ${key}`
    )
    return key
  }
  return translationsPerLocale[l][key] || key
}

export function registerTranslation(
  locale: string,
  translations: TranslationsType
) {
  translationsPerLocale[locale] = translations
}
