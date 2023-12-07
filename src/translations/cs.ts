import type { TranslationsType } from './utils'

const cs: TranslationsType = {
  save: 'Uložit',
  selectSingle: 'Vyberte datum',
  selectMultiple: 'Vyberte data',
  selectRange: 'Vyberte období',
  notAccordingToDateFormat: (inputFormat) =>
    `Formát data musí být ${inputFormat}`,
  mustBeHigherThan: (date) => `Musí to být později ${date}`,
  mustBeLowerThan: (date) => `Musí to být dříve ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Musí být mezi ${startDate} - ${endDate}`,
  dateIsDisabled: 'Den není povolen',
  previous: 'Předchozí',
  next: 'další  ',
  typeInDate: 'Zadejte datum',
  pickDateFromCalendar: 'Vyberte datum z kalendáře',
  close: 'Zavřít',
  minute: 'minuta',
  hour: 'hodina',
}
export default cs
