import { dateTimeFormat, formatDayLabel, formatMonth } from '../shared/intl'

describe('dateTimeFormat', () => {
  it('reuses a formatter for the same locale and options', () => {
    const first = dateTimeFormat('en', { month: 'long' })
    const second = dateTimeFormat('en', { month: 'long' })
    expect(second).toBe(first)
    expect(first.format(new Date(2020, 0, 1))).toBe('January')
  })

  it('reuses month names for a locale', () => {
    expect(formatMonth('en', 0)).toBe('January')
    expect(formatMonth('en', 11)).toBe('December')
    expect(formatMonth('en', 0)).toBe('January')
  })

  it('keeps different option sets apart', () => {
    const long = dateTimeFormat('en', { month: 'long' })
    const short = dateTimeFormat('en', { month: 'short' })
    expect(short).not.toBe(long)
  })
})

describe('formatDayLabel', () => {
  const locales = [
    undefined,
    'ar',
    'ar-SA',
    'ca',
    'cs',
    'da',
    'de',
    'el',
    'en',
    'en-GB',
    'es',
    'fi',
    'fr',
    'he',
    'hi',
    'id',
    'it',
    'ja',
    'ko',
    'nl',
    'nb-NO',
    'pl',
    'pt',
    'ro',
    'ru',
    'sv',
    'th',
    'tr',
    'uk-UA',
    'zh',
    'zh-TW',
  ]

  it('matches a full date format for every day in every locale', () => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    }
    for (const locale of locales) {
      const formatter = new Intl.DateTimeFormat(locale, options)
      for (const year of [1999, 2024, 2026]) {
        for (let month = 0; month < 12; month += 1) {
          const days = new Date(year, month + 1, 0).getDate()
          for (let day = 1; day <= days; day += 1) {
            const expected = formatter.format(new Date(year, month, day))
            if (formatDayLabel(locale, year, month, day) !== expected) {
              throw new Error(
                `${locale} ${year}-${month + 1}-${day}: ` +
                  `${formatDayLabel(locale, year, month, day)} !== ${expected}`
              )
            }
          }
        }
      }
    }
  })

  it('formats each month once instead of once per day', () => {
    const spy = jest.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts')
    const descriptor = Object.getOwnPropertyDescriptor(
      Intl.DateTimeFormat.prototype,
      'format'
    )!
    let formats = 0
    Object.defineProperty(Intl.DateTimeFormat.prototype, 'format', {
      ...descriptor,
      get(this: Intl.DateTimeFormat) {
        formats += 1
        return descriptor.get!.call(this)
      },
    })
    try {
      for (let day = 1; day <= 31; day += 1) formatDayLabel('de', 2031, 0, day)
      spy.mockClear()
      formats = 0
      for (let day = 1; day <= 28; day += 1) formatDayLabel('de', 2031, 1, day)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(formats).toBe(1)
      expect(formatDayLabel('de', 2031, 1, 14)).toBe(
        'Freitag, 14. Februar 2031'
      )
    } finally {
      spy.mockRestore()
      Object.defineProperty(Intl.DateTimeFormat.prototype, 'format', descriptor)
    }
  })
})
