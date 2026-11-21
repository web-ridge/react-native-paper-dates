import { registerTranslation, type TranslationsType } from './utils'

const it: TranslationsType = {
  am: 'AM',
  cancel: 'Annulla',
  close: 'Chiudi',
  confirm: 'OK',
  dateIsDisabled: 'Il giorno non è consentito',
  endDate: 'Data di fine',
  enterDate: 'Inserisci la data',
  enterDates: 'Inserisci le date',
  hour: 'Ora',
  hourOf: (hour, total) => `Ora ${hour} di ${total}`,
  invalidTime: 'Orario non valido',
  minute: 'Minuto',
  minuteOf: (minute, total) => `Minuto ${minute} di ${total}`,
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
  startDate: 'Data di inizio',
  toggleClock: 'Passa all’orologio',
  toggleKeyboard: 'Passa alla tastiera',
  toggleScroll: 'Passa allo scorrimento',
  typeInDate: 'Digita la data',
}

export default it

registerTranslation('it', it)
