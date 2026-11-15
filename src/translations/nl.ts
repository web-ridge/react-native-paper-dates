import type { TranslationsType } from './utils'

const nl: TranslationsType = {
  am: 'AM',
  close: 'Sluit',
  dateIsDisabled: 'Deze dag mag niet',
  hour: 'Uur',
  hourOf: (hour, total) => `Uur ${hour} van ${total}`,
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
  toggleClock: 'Naar klok wisselen',
  toggleKeyboard: 'Toetsenbord wisselen',
  typeInDate: 'Typ datum',
}

export default nl
