import type { TranslationsType } from './utils'

const el: TranslationsType = {
  save: 'Αποθηκεύσετε',
  selectSingle: 'Επιλέξτε ημερομηνία',
  selectMultiple: 'Επιλέξτε ημερομηνίες',
  selectRange: 'Επιλέξτε περίοδο',
  notAccordingToDateFormat: (inputFormat) =>
    `Η μορφή ημερομηνίας πρέπει να είναι ${inputFormat}`,
  mustBeHigherThan: (date) => `Πρέπει να είναι αργότερα${date}`,
  mustBeLowerThan: (date) => `Πρέπει να είναι νωρίτερα τότε ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Πρέπει να είναι μεταξύ ${startDate} - ${endDate}`,
  dateIsDisabled: 'Ημέρα δεν επιτρέπεται',
  previous: 'Προηγούμενος',
  next: 'Επόμενο',
  typeInDate: 'Πληκτρολογήστε την ημερομηνία',
  pickDateFromCalendar: 'Επιλέξτε ημερομηνία από το ημερολόγιο',
  close: 'Κλείσε',
  minute: 'λεπτό',
  hour: 'ώρα',
}
export default el
