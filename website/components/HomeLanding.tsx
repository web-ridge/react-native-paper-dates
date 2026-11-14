import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { withBase } from '@rspress/core/runtime'

function buildMonthCells(): Array<number | null> {
  const cells: Array<number | null> = []
  for (let i = 0; i < JULY_2026_OFFSET; i++) cells.push(null)
  for (let d = 1; d <= DAYS_IN_JULY; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

type CellKind = 'empty' | 'day' | 'in-range' | 'range-start' | 'range-end'

function cellKind(day: number | null): CellKind {
  if (day === null) return 'empty'
  if (day === RANGE_START) return 'range-start'
  if (day === RANGE_END) return 'range-end'
  if (day > RANGE_START && day < RANGE_END) return 'in-range'
  return 'day'
}

/** Material clock face: 12 at top, then clockwise. Selected: 3 o'clock. */
const CLOCK_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const

const CLOCK_SELECTED = 3

const DAYS_IN_JULY = 31

export function HomeLanding() {
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pkg, setPkg] =
    useState<(typeof PKG_MANAGERS)[number]['id']>('yarn')
  const active = PKG_MANAGERS.find((p) => p.id === pkg) ?? PKG_MANAGERS[0]

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
    }
  }, [])

  async function copyInstallCommand() {
    try {
      await navigator.clipboard.writeText(active.command)
      setCopied(true)
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="pd-home">
      <section aria-labelledby="pd-brand" className="pd-hero">
        <div aria-hidden="true" className="pd-hero__plane">
          <div className="pd-hero__wash" />
          <div className="pd-hero__calendar">
            <div className="pd-hero__calendar-meta">
              <span>July 2026</span>
              <span>Select range</span>
            </div>
            <div className="pd-hero__weekdays">
              {WEEKDAYS.map((d, i) => (
                <span key={`${d}-${i}`}>{d}</span>
              ))}
            </div>
                    <div className="pd-hero__grid">
                      {CELLS.map((day, index) => {
                        const kind = cellKind(day)
                        return (
                          <span
                            className={`pd-hero__cell pd-hero__cell--${kind}`}
                            key={index}
                            style={{ animationDelay: `${60 + index * 18}ms` }}
                          >
                            <span className="pd-hero__day">{day ?? ''}</span>
                          </span>
                        )
                      })}
                    </div>
          </div>
        </div>

        <div className="pd-hero__content">
          <h1 className="pd-hero__brand" id="pd-brand">
            <span className="pd-hero__brand-line">Paper</span>
            <span className="pd-hero__brand-line pd-hero__brand-line--accent">
              Dates
            </span>
          </h1>
          <p className="pd-hero__lede">
            Material Design 3 date &amp; time pickers for React Native — on
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
              rel="noreferrer"
              target="_blank"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="pd-install-title" className="pd-install">
        <div className="pd-install__inner">
          <div className="pd-install__copy">
            <h2 className="pd-install__title" id="pd-install-title">
              Add it to your project
            </h2>
            <p className="pd-install__body">
              Drop in beside React Native Paper. One package, every platform.
            </p>
          </div>
          <div className="pd-pkg">
            <div
              aria-label="Package manager"
              className="pd-pkg__tabs"
              role="tablist"
            >
              {PKG_MANAGERS.map((manager) => (
                <button
                  aria-selected={pkg === manager.id}
                  className={
                    pkg === manager.id
                      ? 'pd-pkg__tab pd-pkg__tab--active'
                      : 'pd-pkg__tab'
                  }
                  key={manager.id}
                  onClick={() => {
                    setPkg(manager.id)
                    setCopied(false)
                  }}
                  role="tab"
                  type="button"
                >
                  {manager.label}
                </button>
              ))}
            </div>
            <div className="pd-pkg__command">
              <pre className="pd-pkg__code" tabIndex={0}>
                <code>
                  <span className="pd-pkg__prompt">$</span> {active.command}
                </code>
              </pre>
              <button
                aria-label={
                  copied ? 'Copied to clipboard' : 'Copy install command'
                }
                className={
                  copied
                    ? 'pd-pkg__copy pd-pkg__copy--done'
                    : 'pd-pkg__copy'
                }
                onClick={copyInstallCommand}
                type="button"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="pd-modes-title" className="pd-modes">
        <div className="pd-modes__intro">
          <p className="pd-kicker">Picker modes</p>
          <h2 className="pd-headline" id="pd-modes-title">
            Every selection pattern, one Material language
          </h2>
        </div>
        <ol className="pd-modes__list">
          {MODES.map((mode, index) => (
            <li className="pd-modes__item" key={mode.name}>
              <a className="pd-modes__link" href={withBase(mode.href)}>
                <span aria-hidden="true" className="pd-modes__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="pd-modes__text">
                  <span className="pd-modes__name">{mode.name}</span>
                  <span className="pd-modes__detail">{mode.detail}</span>
                </span>
                <span aria-hidden="true" className="pd-modes__arrow">
                  →
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pd-locales-title" className="pd-locales">
        <div className="pd-locales__head">
          <p className="pd-kicker">Localization</p>
          <h2 className="pd-headline" id="pd-locales-title">
            {LOCALES.length} locales, ready to register
          </h2>
          <p className="pd-body">
            Labels, ranges, and validation follow the locale you set — including
            RTL.
          </p>
          <a
            className="pd-btn pd-btn--ghost pd-locales__cta"
            href={withBase('/guide/localization')}
          >
            Localization guide
          </a>
        </div>

        <div aria-hidden="true" className="pd-marquee">
          <div className="pd-marquee__track">
            {MARQUEE_LOCALES.map((locale, index) => (
              <span
                className="pd-marquee__item"
                dir={locale.rtl ? 'rtl' : undefined}
                key={`${locale.code}-${index}`}
              >
                <span className="pd-marquee__code">{locale.code}</span>
                {locale.sample}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="pd-cta-title" className="pd-cta">
        <div aria-hidden="true" className="pd-cta__plane">
          <div className="pd-cta__wash" />
          <div className="pd-cta__clock">
            <div className="pd-cta__clock-meta">
              <span>3:00</span>
              <span>Select time</span>
            </div>
            <div className="pd-cta__dial">
              <span className="pd-cta__hand" />
              <span className="pd-cta__pivot" />
              {CLOCK_HOURS.map((hour, index) => {
                const angle = hour === 12 ? 0 : hour * 30
                const selected = hour === CLOCK_SELECTED
                return (
                  <span
                    className={
                      selected
                        ? 'pd-cta__hour pd-cta__hour--selected'
                        : 'pd-cta__hour'
                    }
                    key={hour}
                    style={
                      {
                        '--pd-hour-angle': `${angle}deg`,
                        animationDelay: `${80 + index * 40}ms`,
                      } as CSSProperties
                    }
                  >
                    <span className="pd-cta__hour-label">{hour}</span>
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        <div className="pd-cta__content">
          <h2 className="pd-cta__title" id="pd-cta-title">
            Start picking with Paper Dates
          </h2>
          <p className="pd-cta__lede">
            Ship Material date &amp; time flows on every platform.
          </p>
          <div className="pd-hero__actions pd-cta__actions">
            <a
              className="pd-btn pd-btn--filled"
              href={withBase('/guide/introduction')}
            >
              Read the docs
            </a>
            <a
              className="pd-btn pd-btn--ghost"
              href="https://www.reactnativepaperdates.com"
              rel="noreferrer"
              target="_blank"
            >
              Live demo
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

/** July 2026 starts on Wednesday */
const JULY_2026_OFFSET = 3

const CELLS = buildMonthCells()

type LocaleEntry = {
  code: string
  name: string
  rtl?: boolean
  sample: string
}

const LOCALES: LocaleEntry[] = [
  { code: 'ar', name: 'العربية', rtl: true, sample: 'حدد تاريخ' },
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
  { code: 'he', name: 'עברית', rtl: true, sample: 'בחר תאריך' },
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

const MARQUEE_LOCALES = [...LOCALES, ...LOCALES]

/** Material clock face: 12 at top, then clockwise. Selected: 3 o'clock. */

const MODES = [
  {
    detail: 'One day, calendar or input — matching Material date pickers.',
    href: '/guide/date-picker/single-date-picker',
    name: 'Single date',
  },
  {
    detail: 'Start and end selection with tonal range highlighting.',
    href: '/guide/date-picker/range-date-picker',
    name: 'Date range',
  },
  {
    detail: 'Toggle many days in a single Material flow.',
    href: '/guide/date-picker/multiple-dates-picker',
    name: 'Multiple dates',
  },
  {
    detail: 'Text field with calendar affordance for typed or picked dates.',
    href: '/guide/date-picker/input-date-picker',
    name: 'Input date',
  },
  {
    detail: 'Clock and input modes aligned with Material time pickers.',
    href: '/guide/time-picker',
    name: 'Time picker',
  },
] as const

const PKG_MANAGERS = [
  { command: 'yarn add react-native-paper-dates', id: 'yarn', label: 'Yarn' },
  { command: 'npm install react-native-paper-dates', id: 'npm', label: 'npm' },
  { command: 'pnpm add react-native-paper-dates', id: 'pnpm', label: 'pnpm' },
  { command: 'bun add react-native-paper-dates', id: 'bun', label: 'Bun' },
  {
    command: 'deno add npm:react-native-paper-dates',
    id: 'deno',
    label: 'Deno',
  },
] as const

const RANGE_END = 18

const RANGE_START = 14

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

/** July 2026 starts on Wednesday */
