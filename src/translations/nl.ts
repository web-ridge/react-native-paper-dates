import { registerTranslation, type TranslationsType } from './utils'

const nl: TranslationsType = {
  am: 'AM',
  cancel: 'Annuleren',
  close: 'Sluit',
  confirm: 'OK',
  dateIsDisabled: 'Deze dag mag niet',
  endDate: 'Einddatum',
  enterDate: 'Voer datum in',
  enterDates: 'Voer datums in',
  hour: 'Uur',
  hourOf: (hour, total) => `Uur ${hour} van ${total}`,
  invalidTime: 'Ongeldige tijd',
  minute: 'Minuut',
  minuteOf: (minute, total) => `Minuut ${minute} van ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `Moet tussen ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Moet later dan ${date}`,
  mustBeLowerThan: (date) => `Moet eerder dan ${date}`,
  next: 'Volgende',
  notAccordingToDateFormat: (inputFormat) =>
    `Datumformaat moet ${inputFormat} zijn`,
  pickDateFromCalendar: 'Kies datum van kalender',
  pm: 'PM',
  previous: 'Vorige',
  save: 'Opslaan',
  selectMultiple: 'Selecteer datums',
  selectRange: 'Selecteer periode',
  selectSingle: 'Selecteer datum',
  startDate: 'Startdatum',
  toggleClock: 'Naar klok wisselen',
  toggleKeyboard: 'Toetsenbord wisselen',
  toggleScroll: 'Naar scrollen wisselen',
  typeInDate: 'Typ datum',
}

export default nl

registerTranslation('nl', nl)
