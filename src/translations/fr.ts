import type { TranslationsType } from './utils'

const fr: TranslationsType = {
  am: 'AM',
  close: 'Fermer',
  dateIsDisabled: "Le jour n'est pas autorisé",
  hour: 'heures',
  hourOf: (hour, total) => `Heure ${hour} sur ${total}`,
  minute: 'minutes',
  minuteOf: (minute, total) => `Minute ${minute} sur ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `La date doit être entre le ${startDate} et le ${endDate}`,
  mustBeHigherThan: (date) => `La date doit être après le ${date}`,
  mustBeLowerThan: (date) => `La date doit être avant le ${date}`,
  next: 'Suivant',
  notAccordingToDateFormat: (inputFormat) =>
    `La date doit être au format ${inputFormat}`,
  pickDateFromCalendar: 'Sélectionner une date dans le calendrier',
  pm: 'PM',
  previous: 'Précédent',
  save: 'Enregistrer',
  selectMultiple: 'Sélectionner plusieurs dates',
  selectRange: 'Sélectionner une période',
  selectSingle: 'Sélectionner une date',
  toggleClock: 'Basculer vers l’horloge',
  toggleKeyboard: 'Basculer le clavier',
  typeInDate: 'Entrer la date',
}

export default fr
