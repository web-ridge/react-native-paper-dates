import { registerTranslation, type TranslationsType } from './utils'

const noNO: TranslationsType = {
  am: 'AM',
  cancel: 'Avbryt',
  close: 'Lukk',
  confirm: 'OK',
  dateIsDisabled: 'Denne dagen er ikke tillatt',
  enterDate: 'Skriv inn dato',
  enterDates: 'Skriv inn datoer',
  hour: 'Time',
  hourOf: (hour, total) => `Time ${hour} av ${total}`,
  invalidTime: 'Ugyldig tid',
  minute: 'Minutt',
  minuteOf: (minute, total) => `Minutt ${minute} av ${total}`,
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
  toggleClock: 'Bytt til klokke',
  toggleKeyboard: 'Bytt tastatur',
  toggleScroll: 'Bytt til rulling',
  typeInDate: 'Skriv inn dato',
}

export default noNO

registerTranslation('no-NO', noNO)
