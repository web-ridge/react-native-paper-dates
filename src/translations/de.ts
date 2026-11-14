import type { TranslationsType } from './utils'

const de: TranslationsType = {
  am: 'AM',
  close: 'Schliessen',
  dateIsDisabled: 'Datum nicht wählbar',
  hour: 'Stunde',
  minute: 'Minute',
  mustBeBetween: (startDate, endDate) =>
    `Muss in dieser Zeitspanne liegen ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Muss nach dem ${date} sein`,
  mustBeLowerThan: (date) => `Muss vor dem ${date} sein`,
  next: 'Nächstes',
  notAccordingToDateFormat: (inputFormat) =>
    `Das Format sollte ${inputFormat} sein`,
  pickDateFromCalendar: 'Datum vom Kalender auswählen',
  pm: 'PM',
  previous: 'Vorheriges',
  save: 'Speichern',
  selectMultiple: 'Wähle Daten',
  selectRange: 'Wähle Zeitspanne',
  selectSingle: 'Wähle Datum',
  toggleKeyboard: 'Tastatur umschalten',
  typeInDate: 'Datum eingeben',
}
export default de
