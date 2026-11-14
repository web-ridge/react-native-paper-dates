import type { TranslationsType } from './utils'

const cs: TranslationsType = {
  am: 'dop.',
  close: 'Zavřít',
  dateIsDisabled: 'Den není povolen',
  hour: 'hodina',
  minute: 'minuta',
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
  toggleKeyboard: 'Přepnout klávesnici',
  typeInDate: 'Zadejte datum',
}
export default cs
