import type { TranslationsType } from './utils'

const noNO: TranslationsType = {
  save: 'Lagre',
  selectSingle: 'Velg dato',
  selectMultiple: 'Velg datoer',
  selectRange: 'Velg periode',
  notAccordingToDateFormat: (inputFormat) =>
    `Datoformatet må være ${inputFormat}`,
  mustBeHigherThan: (date) => `Må være senere enn ${date}`,
  mustBeLowerThan: (date) => `Må være tidligere enn ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Må være mellom ${startDate} - ${endDate}`,
  dateIsDisabled: 'Denne dagen er ikke tillatt',
  previous: 'Forrige',
  next: 'Neste',
  typeInDate: 'Skriv inn dato',
  pickDateFromCalendar: 'Velg dato fra kalenderen',
  close: 'Lukk',
  hour: 'Time',
  minute: 'Minutt',
}
export default noNO
