import type { TranslationsType } from './utils'

const ca: TranslationsType = {
  am: 'a.m.',
  close: 'Tancar',
  dateIsDisabled: 'Dia no permès',
  hour: 'Hora',
  minute: 'Minut',
  mustBeBetween: (startDate, endDate) =>
    `Ha d'estar entre ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Ha de ser posterior a ${date}`,
  mustBeLowerThan: (date) => `Ha de ser anterior a ${date}`,
  next: 'Següent',
  notAccordingToDateFormat: (inputFormat) =>
    `El format de la data ha de ser ${inputFormat}`,
  pickDateFromCalendar: 'Seleccionar la data del calendari',
  pm: 'p.m.',
  previous: 'Anterior',
  save: 'Guardar',
  selectMultiple: 'Seleccionar dates',
  selectRange: 'Seleccionar període',
  selectSingle: 'Seleccionar data',
  toggleKeyboard: 'Alterna el teclat',
  typeInDate: 'Escriu la data',
}
export default ca
