import { registerTranslation, type TranslationsType } from './utils'

const ro: TranslationsType = {
  am: 'AM',
  cancel: 'Anulează',
  close: 'Închide',
  confirm: 'OK',
  dateIsDisabled: 'Data nu este permisă',
  enterDate: 'Introduceți data',
  enterDates: 'Introduceți datele',
  hour: 'Oră',
  hourOf: (hour, total) => `Ora ${hour} din ${total}`,
  invalidTime: 'Oră nevalidă',
  minute: 'Minut',
  minuteOf: (minute, total) => `Minutul ${minute} din ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `Trebuie să fie între ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Trebuie să fie mai târziu de ${date}`,
  mustBeLowerThan: (date) => `Trebuie să fie mai devreme de ${date}`,
  next: 'Următorul',
  notAccordingToDateFormat: (inputFormat) =>
    `Formatul datei trebuie să fie ${inputFormat}`,
  pickDateFromCalendar: 'Alege o dată din calendar',
  pm: 'PM',
  previous: 'Anterior',
  save: 'Salvează',
  selectMultiple: 'Selectează datele',
  selectRange: 'Selectează perioada',
  selectSingle: 'Selectează data',
  toggleClock: 'Comută ceasul',
  toggleKeyboard: 'Comută tastatura',
  typeInDate: 'Tipul în dată',
}

export default ro

registerTranslation('ro', ro)
