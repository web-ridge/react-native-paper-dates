import { registerTranslation, type TranslationsType } from './utils'

const cs: TranslationsType = {
  am: 'dop.',
  cancel: 'Zrušit',
  close: 'Zavřít',
  confirm: 'OK',
  dateIsDisabled: 'Den není povolen',
  enterDate: 'Zadejte datum',
  enterDates: 'Zadejte data',
  hour: 'hodina',
  hourOf: (hour, total) => `Hodina ${hour} z ${total}`,
  minute: 'minuta',
  minuteOf: (minute, total) => `Minuta ${minute} z ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `Musí být mezi ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Musí to být později ${date}`,
  mustBeLowerThan: (date) => `Musí to být dříve ${date}`,
  next: 'další  ',
  notAccordingToDateFormat: (inputFormat) =>
    `Formát data musí být ${inputFormat}`,
  pickDateFromCalendar: 'Vyberte datum z kalendáře',
  pm: 'odp.',
  previous: 'Předchozí',
  save: 'Uložit',
  selectMultiple: 'Vyberte data',
  selectRange: 'Vyberte období',
  selectSingle: 'Vyberte datum',
  toggleClock: 'Přepnout hodiny',
  toggleKeyboard: 'Přepnout klávesnici',
  typeInDate: 'Zadejte datum',
}

export default cs

registerTranslation('cs', cs)
