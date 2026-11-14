import type { TranslationsType } from './utils'

const noNO: TranslationsType = {
  am: 'AM',
  close: 'Lukk',
  dateIsDisabled: 'Denne dagen er ikke tillatt',
  hour: 'Time',
  minute: 'Minutt',
  mustBeBetween: (startDate, endDate) =>
    `Må være mellom ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Må være senere enn ${date}`,
  mustBeLowerThan: (date) => `Må være tidligere enn ${date}`,
  next: 'Neste',
  notAccordingToDateFormat: (inputFormat) =>
    `Datoformatet må være ${inputFormat}`,
  pickDateFromCalendar: 'Velg dato fra kalenderen',
  pm: 'PM',
  previous: 'Forrige',
  save: 'Lagre',
  selectMultiple: 'Velg datoer',
  selectRange: 'Velg periode',
  selectSingle: 'Velg dato',
  toggleKeyboard: 'Bytt tastatur',
  typeInDate: 'Skriv inn dato',
}
export default noNO
