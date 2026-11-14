import type { TranslationsType } from './utils'

const sv: TranslationsType = {
  am: 'fm',
  close: 'Stäng',
  dateIsDisabled: 'Datumet är inte tillåtet',
  hour: 'Timme',
  minute: 'Minut',
  mustBeBetween: (startDate, endDate) =>
    `Måste vara mellan ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Måste vara efter ${date}`,
  mustBeLowerThan: (date) => `Måste vara före ${date}`,
  next: 'Nästa',
  notAccordingToDateFormat: (inputFormat) =>
    `Datum måste vara i formatet ${inputFormat}`,
  pickDateFromCalendar: 'Välj datum i kalender',
  pm: 'em',
  previous: 'Föregående',
  save: 'Spara',
  selectMultiple: 'Välj datum',
  selectRange: 'Välj period',
  selectSingle: 'Välj datum',
  toggleKeyboard: 'Växla tangentbord',
  typeInDate: 'Skriv datum',
}
export default sv
