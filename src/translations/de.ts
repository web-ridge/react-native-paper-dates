import type { TranslationsType } from './utils'
const de: TranslationsType = {
  save: 'Speichern',
  selectSingle: 'Wähle Datum',
  selectMultiple: 'Wähle Daten',
  selectRange: 'Wähle Zeitspanne',
  notAccordingToDateFormat: (inputFormat) =>
    `Das Format sollte ${inputFormat} sein`,
  mustBeHigherThan: (date) => `Muss nach dem ${date} sein`,
  mustBeLowerThan: (date) => `Muss vor dem ${date} sein`,
  mustBeBetween: (startDate, endDate) =>
    `Muss in dieser Zeitspanne liegen ${startDate} - ${endDate}`,
  dateIsDisabled: 'Datum nicht wählbar',
  previous: 'Vorheriges',
  next: 'Nächstes',
  typeInDate: 'Datum eingeben',
  pickDateFromCalendar: 'Datum vom Kalender auswählen',
  close: 'Schliessen',
}
export default de
