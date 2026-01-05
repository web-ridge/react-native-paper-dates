import type { TranslationsType } from './utils'

const da: TranslationsType = {
  save: 'Gem',
  selectSingle: 'Vælg dato',
  selectMultiple: 'Vælg datoer',
  selectRange: 'Vælg periode',
  notAccordingToDateFormat: (inputFormat) =>
    `Dato formatet skal være ${inputFormat}`,
  mustBeHigherThan: (date) => `Skal ligge efter ${date}`,
  mustBeLowerThan: (date) => `Skal ligge før ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Skal være mellem ${startDate} - ${endDate}`,
  dateIsDisabled: 'Denne dag er ikke gyldig',
  previous: 'Forrige',
  next: 'Næste',
  typeInDate: 'Indtast dato',
  pickDateFromCalendar: 'Vælg en dato fra kalender',
  close: 'Luk',
  minute: 'Minut',
  hour: 'Time',
}
export default da
