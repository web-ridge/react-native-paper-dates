import { registerTranslation, type TranslationsType } from './utils'

const ca: TranslationsType = {
  am: 'a.m.',
  cancel: 'Cancel·la',
  close: 'Tancar',
  confirm: "D'acord",
  dateIsDisabled: 'Dia no permès',
  enterDate: 'Introdueix la data',
  enterDates: 'Introdueix les dates',
  hour: 'Hora',
  hourOf: (hour, total) => `Hora ${hour} de ${total}`,
  invalidTime: 'Hora no vàlida',
  minute: 'Minut',
  minuteOf: (minute, total) => `Minut ${minute} de ${total}`,
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
  toggleClock: 'Alterna el rellotge',
  toggleKeyboard: 'Alterna el teclat',
  toggleScroll: 'Alterna el desplaçament',
  typeInDate: 'Escriu la data',
}

export default ca

registerTranslation('ca', ca)
