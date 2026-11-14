import type { TranslationsType } from './utils'

const es: TranslationsType = {
  am: 'a.m.',
  close: 'Cerrar',
  dateIsDisabled: 'Día no permitido',
  hour: 'Hora',
  minute: 'Minuto',
  mustBeBetween: (startDate, endDate) =>
    `Debe estar entre ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Debe ser posterior a ${date}`,
  mustBeLowerThan: (date) => `Debe ser anterior a ${date}`,
  next: 'Siguiente',
  notAccordingToDateFormat: (inputFormat) =>
    `Formato de fecha debe ser ${inputFormat}`,
  pickDateFromCalendar: 'Seleccionar fecha del calendario',
  pm: 'p.m.',
  previous: 'Anterior',
  save: 'Guardar',
  selectMultiple: 'Seleccionar fechas',
  selectRange: 'Seleccionar periodo',
  selectSingle: 'Seleccionar fecha',
  toggleKeyboard: 'Alternar teclado',
  typeInDate: 'Escribir fecha',
}
export default es
