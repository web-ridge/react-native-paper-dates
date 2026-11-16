import { registerTranslation, type TranslationsType } from './utils'

const da: TranslationsType = {
  am: 'AM',
  cancel: 'Annuller',
  close: 'Luk',
  confirm: 'OK',
  dateIsDisabled: 'Denne dag er ikke gyldig',
  enterDate: 'Indtast dato',
  enterDates: 'Indtast datoer',
  hour: 'Time',
  hourOf: (hour, total) => `Time ${hour} af ${total}`,
  invalidTime: 'Ugyldigt tidspunkt',
  minute: 'Minut',
  minuteOf: (minute, total) => `Minut ${minute} af ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `Skal være mellem ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Skal ligge efter ${date}`,
  mustBeLowerThan: (date) => `Skal ligge før ${date}`,
  next: 'Næste',
  notAccordingToDateFormat: (inputFormat) =>
    `Dato formatet skal være ${inputFormat}`,
  pickDateFromCalendar: 'Vælg en dato fra kalender',
  pm: 'PM',
  previous: 'Forrige',
  save: 'Gem',
  selectMultiple: 'Vælg datoer',
  selectRange: 'Vælg periode',
  selectSingle: 'Vælg dato',
  toggleClock: 'Skift til ur',
  toggleKeyboard: 'Skift tastatur',
  typeInDate: 'Indtast dato',
}

export default da

registerTranslation('da', da)
