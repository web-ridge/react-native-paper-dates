import type { TranslationsType } from './utils'

const it: TranslationsType = {
  am: 'AM',
  close: 'Chiudi',
  dateIsDisabled: 'Il giorno non è consentito',
  hour: 'Ora',
  minute: 'Minuto',
  mustBeBetween: (startDate, endDate) =>
    `Deve essere compreso tra ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Deve essere successivo a ${date}`,
  mustBeLowerThan: (date) => `Deve essere precedente a ${date}`,
  next: 'Successivo',
  notAccordingToDateFormat: (inputFormat) =>
    `Il formato della data deve essere ${inputFormat}`,
  pickDateFromCalendar: 'Scegli data dal calendario',
  pm: 'PM',
  previous: 'Precedente',
  save: 'Salva',
  selectMultiple: 'Seleziona le date',
  selectRange: 'Seleziona il periodo',
  selectSingle: 'Seleziona la data',
  toggleKeyboard: 'Passa alla tastiera',
  typeInDate: 'Digita la data',
}
export default it
