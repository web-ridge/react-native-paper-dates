import { useState } from 'react'
import { withBase } from '@rspress/core/runtime'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

/** July 2026 starts on Wednesday */
const JULY_2026_OFFSET = 3
const DAYS_IN_JULY = 31
const RANGE_START = 14
const RANGE_END = 18

type CellKind = 'empty' | 'day' | 'in-range' | 'range-start' | 'range-end'

function cellKind(day: number | null): CellKind {
  if (day === null) return 'empty'
  if (day === RANGE_START) return 'range-start'
  if (day === RANGE_END) return 'range-end'
  if (day > RANGE_START && day < RANGE_END) return 'in-range'
  return 'day'
}

function buildMonthCells(): Array<number | null> {
  const cells: Array<number | null> = []
  for (let i = 0; i < JULY_2026_OFFSET; i++) cells.push(null)
  for (let d = 1; d <= DAYS_IN_JULY; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const CELLS = buildMonthCells()

const PKG_MANAGERS = [
  { id: 'yarn', label: 'Yarn', command: 'yarn add react-native-paper-dates' },
  { id: 'npm', label: 'npm', command: 'npm install react-native-paper-dates' },
  { id: 'pnpm', label: 'pnpm', command: 'pnpm add react-native-paper-dates' },
  { id: 'bun', label: 'Bun', command: 'bun add react-native-paper-dates' },
  {
    id: 'deno',
    label: 'Deno',
    command: 'deno add npm:react-native-paper-dates',
  },
] as const

const MODES = [
  {
    name: 'Single date',
    detail: 'One day, calendar or input — matching Material date pickers.',
    href: '/guide/date-picker/single-date-picker',
  },
  {
    name: 'Date range',
    detail: 'Start and end selection with tonal range highlighting.',
    href: '/guide/date-picker/range-date-picker',
  },
  {
    name: 'Multiple dates',
    detail: 'Toggle many days in a single Material flow.',
    href: '/guide/date-picker/multiple-dates-picker',
  },
  {
    name: 'Input date',
    detail: 'Text field with calendar affordance for typed or picked dates.',
    href: '/guide/date-picker/input-date-picker',
  },
  {
    name: 'Time picker',
    detail: 'Clock and input modes aligned with Material time pickers.',
    href: '/guide/time-picker',
  },
] as const

const CLOCK_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const
const ACTIVE_HOUR = 6

type LocaleEntry = {
  code: string
  name: string
  sample: string
  rtl?: boolean
}

const LOCALES: LocaleEntry[] = [
  { code: 'ar', name: 'العربية', sample: 'حدد تاريخ', rtl: true },
  { code: 'ca', name: 'Català', sample: 'Seleccionar data' },
  { code: 'cs', name: 'Čeština', sample: 'Vyberte datum' },
  { code: 'da', name: 'Dansk', sample: 'Vælg dato' },
  { code: 'de', name: 'Deutsch', sample: 'Wähle Datum' },
  { code: 'el', name: 'Ελληνικά', sample: 'Επιλέξτε ημερομηνία' },
  { code: 'en', name: 'English', sample: 'Select date' },
  { code: 'en-GB', name: 'English (UK)', sample: 'Select date' },
  { code: 'es', name: 'Español', sample: 'Seleccionar fecha' },
  { code: 'fi', name: 'Suomi', sample: 'Valitse päivämäärä' },
  { code: 'fr', name: 'Français', sample: 'Sélectionner une date' },
  { code: 'he', name: 'עברית', sample: 'בחר תאריך', rtl: true },
  { code: 'hi', name: 'हिन्दी', sample: 'तारीख़ चुनें' },
  { code: 'id', name: 'Indonesia', sample: 'Pilih tanggal' },
  { code: 'it', name: 'Italiano', sample: 'Seleziona la data' },
  { code: 'ja', name: '日本語', sample: '日付を選択' },
  { code: 'ko', name: '한국어', sample: '날짜 선택' },
  { code: 'nl', name: 'Nederlands', sample: 'Selecteer datum' },
  { code: 'no-NO', name: 'Norsk', sample: 'Velg dato' },
  { code: 'pl', name: 'Polski', sample: 'Wybierz datę' },
  { code: 'pt', name: 'Português', sample: 'Selecione a data' },
  { code: 'ro', name: 'Română', sample: 'Selectează data' },
  { code: 'ru', name: 'Русский', sample: 'Выбор даты' },
  { code: 'sv', name: 'Svenska', sample: 'Välj datum' },
  { code: 'th', name: 'ไทย', sample: 'เลือกวันที่' },
  { code: 'tr', name: 'Türkçe', sample: 'Tarih seç' },
  { code: 'uk-UA', name: 'Українська', sample: 'Оберіть дату' },
  { code: 'zh', name: '简体中文', sample: '选择日期' },
  { code: 'zh-TW', name: '繁體中文', sample: '選擇日期' },
]

const LOCALE_SPOTLIGHT = (
  ['ar', 'en', 'fr', 'ja', 'ko', 'ru', 'th', 'zh'] as const
).map((code) => LOCALES.find((locale) => locale.code === code)!)

export function HomeLanding() {
  const [pkg, setPkg] =
    useState<(typeof PKG_MANAGERS)[number]['id']>('yarn')
  const active = PKG_MANAGERS.find((p) => p.id === pkg) ?? PKG_MANAGERS[0]

  return (
    <div className="pd-home">
      <section className="pd-hero" aria-labelledby="pd-brand">
        <div className="pd-hero__atmosphere" aria-hidden="true">
          <div className="pd-hero__mesh" />
          <div className="pd-hero__glow" />
        </div>

        <div className="pd-hero__frame">
          <div className="pd-hero__copy">
            <p className="pd-hero__label">React Native</p>
            <h1 id="pd-brand" className="pd-hero__brand">
              Paper <span>Dates</span>
            </h1>
            <p className="pd-hero__lede">
              Cross-platform Material Design 3 date &amp; time pickers for
              Android, iOS, and web.
            </p>
            <div className="pd-hero__actions">
              <a
                className="pd-btn pd-btn--filled"
                href={withBase('/guide/introduction')}
              >
                Get started
              </a>
              <a
                className="pd-btn pd-btn--ghost"
                href="https://github.com/web-ridge/react-native-paper-dates"
                target="_blank"
                rel="noreferrer"
              >
                View on GitHub
              </a>
            </div>

            <div className="pd-pkg">
              <div
                className="pd-pkg__tabs"
                role="tablist"
                aria-label="Package manager"
              >
                {PKG_MANAGERS.map((manager) => (
                  <button
                    key={manager.id}
                    type="button"
                    role="tab"
                    aria-selected={pkg === manager.id}
                    className={
                      pkg === manager.id
                        ? 'pd-pkg__tab pd-pkg__tab--active'
                        : 'pd-pkg__tab'
                    }
                    onClick={() => setPkg(manager.id)}
                  >
                    {manager.label}
                  </button>
                ))}
              </div>
              <pre className="pd-pkg__code" tabIndex={0}>
                <code>
                  <span className="pd-pkg__prompt">$</span> {active.command}
                </code>
              </pre>
            </div>
          </div>

          <div className="pd-hero__visual" aria-hidden="true">
            <div className="pd-picker-stack">
              <div className="pd-picker">
                <div className="pd-picker__surface">
                  <header className="pd-picker__header">
                    <p className="pd-picker__overline">Select range</p>
                    <p className="pd-picker__headline">
                      Jul 14 – <span>Jul 18</span>
                    </p>
                  </header>
                  <div className="pd-picker__body">
                    <div className="pd-picker__month-row">
                      <span className="pd-picker__month">July 2026</span>
                      <span className="pd-picker__nav">
                        <span className="pd-picker__nav-btn">
                          <ChevronLeftIcon />
                        </span>
                        <span className="pd-picker__nav-btn">
                          <ChevronRightIcon />
                        </span>
                      </span>
                    </div>
                    <div className="pd-picker__weekdays">
                      {WEEKDAYS.map((d, i) => (
                        <span key={`${d}-${i}`}>{d}</span>
                      ))}
                    </div>
                    <div className="pd-picker__grid">
                      {CELLS.map((day, index) => {
                        const kind = cellKind(day)
                        return (
                          <span
                            key={index}
                            className={`pd-picker__cell pd-picker__cell--${kind}`}
                            style={{ animationDelay: `${90 + index * 14}ms` }}
                          >
                            <span className="pd-picker__day">{day ?? ''}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <footer className="pd-picker__actions">
                    <span className="pd-picker__text-btn">Cancel</span>
                    <span className="pd-picker__text-btn">OK</span>
                  </footer>
                </div>
              </div>

              <div className="pd-time">
                <div className="pd-time__surface">
                  <header className="pd-time__header">
                    <p className="pd-time__overline">Select time</p>
                    <p className="pd-time__digits">
                      <span className="pd-time__digit pd-time__digit--active">
                        06
                      </span>
                      <span className="pd-time__colon">:</span>
                      <span className="pd-time__digit">30</span>
                      <span className="pd-time__period">
                        <span className="pd-time__period-btn pd-time__period-btn--active">
                          AM
                        </span>
                        <span className="pd-time__period-btn">PM</span>
                      </span>
                    </p>
                  </header>
                  <div className="pd-time__clock">
                    <div className="pd-time__face">
                      <span
                        className="pd-time__hand"
                        style={{
                          // Matches AnalogClock: rotate(-90 + hour * 30)
                          transform: `rotate(${-90 + ACTIVE_HOUR * 30}deg)`,
                        }}
                      >
                        <span className="pd-time__hand-tip" />
                      </span>
                      <span className="pd-time__center" />
                      {CLOCK_HOURS.map((hour, index) => {
                        const angle = index * 30
                        return (
                          <span
                            key={hour}
                            className={
                              hour === ACTIVE_HOUR
                                ? 'pd-time__hour pd-time__hour--active'
                                : 'pd-time__hour'
                            }
                            style={{
                              transform: `rotate(${angle}deg) translateY(-78px) rotate(-${angle}deg)`,
                            }}
                          >
                            {hour}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <footer className="pd-picker__actions">
                    <span className="pd-picker__text-btn">Cancel</span>
                    <span className="pd-picker__text-btn">OK</span>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pd-locales" aria-labelledby="pd-locales-title">
        <div className="pd-section-head">
          <p className="pd-kicker">Localization</p>
          <h2 id="pd-locales-title" className="pd-headline">
            Dates that speak your users&apos; language
          </h2>
          <p className="pd-body">
            {LOCALES.length} built-in locales — register one and picker labels,
            ranges, and validation follow.
          </p>
          <a
            className="pd-btn pd-btn--ghost pd-locales__cta"
            href={withBase('/guide/localization')}
          >
            Localization guide
          </a>
        </div>

        <div className="pd-locales__spotlight" aria-hidden="true">
          {LOCALE_SPOTLIGHT.map((locale, index) => (
            <span
              key={locale.code}
              className="pd-locales__spotlight-item"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              {locale.sample}
            </span>
          ))}
        </div>

        <ul className="pd-locales__grid">
          {LOCALES.map((locale, index) => (
            <li
              key={locale.code}
              className="pd-locales__item"
              style={{ animationDelay: `${40 + index * 18}ms` }}
            >
              <span className="pd-locales__code">{locale.code}</span>
              <span className="pd-locales__name" lang={locale.code}>
                {locale.name}
              </span>
              <span
                className="pd-locales__sample"
                dir={locale.rtl ? 'rtl' : undefined}
              >
                {locale.sample}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pd-modes" aria-labelledby="pd-modes-title">
        <div className="pd-section-head">
          <p className="pd-kicker">Picker modes</p>
          <h2 id="pd-modes-title" className="pd-headline">
            One Material language,
            <br />
            every selection pattern
          </h2>
          <p className="pd-body">
            Familiar MD3 flows — adapted for React Native Paper across
            platforms.
          </p>
        </div>
        <ul className="pd-modes-grid">
          {MODES.map((mode) => (
            <li key={mode.name}>
              <a className="pd-mode-card" href={withBase(mode.href)}>
                <span className="pd-mode-card__title">{mode.name}</span>
                <span className="pd-mode-card__detail">{mode.detail}</span>
                <span className="pd-mode-card__cta">View docs →</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="pd-fit" aria-labelledby="pd-fit-title">
        <div className="pd-fit__inner">
          <div className="pd-fit__copy">
            <p className="pd-kicker">Material You</p>
            <h2 id="pd-fit-title" className="pd-headline">
              Tonal, localizable, and light on your bundle
            </h2>
            <p className="pd-body">
              Circular day selection, range highlighting, and Intl-powered
              locales — without a heavy date stack.
            </p>
          </div>
          <div className="pd-fit__stats" aria-hidden="true">
            <div className="pd-stat">
              <span className="pd-stat__value">MD3</span>
              <span className="pd-stat__label">Design system</span>
            </div>
            <div className="pd-stat">
              <span className="pd-stat__value">{LOCALES.length}</span>
              <span className="pd-stat__label">Locales</span>
            </div>
            <div className="pd-stat">
              <span className="pd-stat__value">3</span>
              <span className="pd-stat__label">Platforms</span>
            </div>
            <div className="pd-stat">
              <span className="pd-stat__value">TS</span>
              <span className="pd-stat__label">First-class</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pd-cta" aria-labelledby="pd-cta-title">
        <h2 id="pd-cta-title" className="pd-cta__title">
          Start picking with Paper Dates
        </h2>
        <p className="pd-cta__lede">
          Add it beside React Native Paper and ship Material date &amp; time
          flows on every platform.
        </p>
        <div className="pd-hero__actions pd-cta__actions">
          <a className="pd-btn pd-btn--filled" href={withBase('/guide/introduction')}>
            Read the docs
          </a>
          <a
            className="pd-btn pd-btn--ghost"
            href="https://www.reactnativepaperdates.com"
            target="_blank"
            rel="noreferrer"
          >
            Live demo
          </a>
        </div>
      </section>
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
      />
    </svg>
  )
}
