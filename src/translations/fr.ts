import type { TranslationsType } from './utils'

const fr: TranslationsType = {
  save: 'Enregistrer',
  selectSingle: 'Sélectionner une date',
  selectMultiple: 'Sélectionner plusieurs dates',
  selectRange: 'Sélectionner une période',
  notAccordingToDateFormat: (inputFormat) =>
    `La date doit être au format ${inputFormat}`,
  mustBeHigherThan: (date) => `La date doit être après le ${date}`,
  mustBeLowerThan: (date) => `La date doit être avant le ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `La date doit être entre le ${startDate} et le ${endDate}`,
  dateIsDisabled: "Le jour n'est pas autorisé",
  previous: 'Précédent',
  next: 'Suivant',
  typeInDate: 'Entrer la date',
  pickDateFromCalendar: 'Sélectionner une date dans le calendrier',
  close: 'Fermer',
  minute: 'minutes',
  hour: 'heures',
}
export default fr
