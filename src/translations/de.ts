import { registerTranslation, type TranslationsType } from './utils'

const de: TranslationsType = {
  am: 'AM',
  cancel: 'Abbrechen',
  close: 'Schliessen',
  confirm: 'OK',
  dateIsDisabled: 'Datum nicht wählbar',
  enterDate: 'Datum eingeben',
  enterDates: 'Daten eingeben',
  hour: 'Stunde',
  hourOf: (hour, total) => `Stunde ${hour} von ${total}`,
  invalidTime: 'Ungültige Zeit',
  minute: 'Minute',
  minuteOf: (minute, total) => `Minute ${minute} von ${total}`,
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
  toggleClock: 'Zur Uhr umschalten',
  toggleKeyboard: 'Tastatur umschalten',
  typeInDate: 'Datum eingeben',
}

export default de

registerTranslation('de', de)
