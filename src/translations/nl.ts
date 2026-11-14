import type { TranslationsType } from './utils'

const nl: TranslationsType = {
  am: 'AM',
  close: 'Sluit',
  dateIsDisabled: 'Deze dag mag niet',
  hour: 'Uur',
  minute: 'Minuut',
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
  toggleKeyboard: 'Toetsenbord wisselen',
  typeInDate: 'Typ datum',
}
export default nl
