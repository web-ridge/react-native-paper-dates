import type { TranslationsType } from './utils'

const nl: TranslationsType = {
  save: 'Opslaan',
  selectSingle: 'Selecteer datum',
  selectMultiple: 'Selecteer datums',
  selectRange: 'Selecteer periode',
  notAccordingToDateFormat: (inputFormat) =>
    `Datumformaat moet ${inputFormat} zijn`,
  mustBeHigherThan: (date) => `Moet later dan ${date}`,
  mustBeLowerThan: (date) => `Moet eerder dan ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Moet tussen ${startDate} - ${endDate}`,
  dateIsDisabled: 'Deze dag mag niet',
  previous: 'Vorige',
  next: 'Volgende',
  typeInDate: 'Typ datum',
  pickDateFromCalendar: 'Kies datum van kalender',
  close: 'Sluit',
}
export default nl
