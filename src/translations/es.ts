import type { TranslationsType } from './utils'

const es: TranslationsType = {
  am: 'a.m.',
  close: 'Cerrar',
  dateIsDisabled: 'Día no permitido',
  hour: 'Hora',
  hourOf: (hour, total) => `Hora ${hour} de ${total}`,
  minute: 'Minuto',
  minuteOf: (minute, total) => `Minuto ${minute} de ${total}`,
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
  toggleClock: 'Alternar reloj',
  toggleKeyboard: 'Alternar teclado',
  typeInDate: 'Escribir fecha',
}
export default es
