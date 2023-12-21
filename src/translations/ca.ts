import type { TranslationsType } from './utils'

const ca: TranslationsType = {
  save: 'Guardar',
  selectSingle: 'Seleccionar data',
  selectMultiple: 'Seleccionar dates',
  selectRange: 'Seleccionar període',
  notAccordingToDateFormat: (inputFormat) =>
    `El format de la data ha de ser ${inputFormat}`,
  mustBeHigherThan: (date) => `Ha de ser posterior a ${date}`,
  mustBeLowerThan: (date) => `Ha de ser anterior a ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Ha d'estar entre ${startDate} - ${endDate}`,
  dateIsDisabled: 'Dia no permès',
  previous: 'Anterior',
  next: 'Següent',
  typeInDate: 'Escriu la data',
  pickDateFromCalendar: 'Seleccionar la data del calendari',
  close: 'Tancar',
  minute: 'Minut',
  hour: 'Hora',
}
export default ca
