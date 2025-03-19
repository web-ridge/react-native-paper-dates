import type { TranslationsType } from './utils'

const sv: TranslationsType = {
  save: 'Spara',
  selectSingle: 'Välj datum',
  selectMultiple: 'Välj datum',
  selectRange: 'Välj period',
  notAccordingToDateFormat: (inputFormat) =>
    `Datum måste vara i formatet ${inputFormat}`,
  mustBeHigherThan: (date) => `Måste vara efter ${date}`,
  mustBeLowerThan: (date) => `Måste vara före ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Måste vara mellan ${startDate} - ${endDate}`,
  dateIsDisabled: 'Datumet är inte tillåtet',
  previous: 'Föregående',
  next: 'Nästa',
  typeInDate: 'Skriv datum',
  pickDateFromCalendar: 'Välj datum i kalender',
  close: 'Stäng',
  minute: 'Minut',
  hour: 'Timme',
}
export default sv
