import type { TranslationsType } from './utils'

const it: TranslationsType = {
  save: 'Salva',
  selectSingle: 'Seleziona la data',
  selectMultiple: 'Seleziona le date',
  selectRange: 'Seleziona il periodo',
  notAccordingToDateFormat: (inputFormat) =>
    `Il formato della data deve essere ${inputFormat}`,
  mustBeHigherThan: (date) => `Deve essere successivo a ${date}`,
  mustBeLowerThan: (date) => `Deve essere precedente a ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Deve essere compreso tra ${startDate} - ${endDate}`,
  dateIsDisabled: 'Il giorno non è consentito',
  previous: 'Precedente',
  next: 'Successivo',
  typeInDate: 'Digita la data',
  pickDateFromCalendar: 'Scegli data dal calendario',
  close: 'Chiudi',
  hour: 'Ora',
  minute: 'Minuto',
}
export default it
