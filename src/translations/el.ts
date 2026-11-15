import type { TranslationsType } from './utils'

const el: TranslationsType = {
  am: 'π.μ.',
  close: 'Κλείσε',
  dateIsDisabled: 'Ημέρα δεν επιτρέπεται',
  hour: 'ώρα',
  hourOf: (hour, total) => `Ώρα ${hour} από ${total}`,
  minute: 'λεπτό',
  minuteOf: (minute, total) => `Λεπτό ${minute} από ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `Πρέπει να είναι μεταξύ ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Πρέπει να είναι αργότερα${date}`,
  mustBeLowerThan: (date) => `Πρέπει να είναι νωρίτερα τότε ${date}`,
  next: 'Επόμενο',
  notAccordingToDateFormat: (inputFormat) =>
    `Η μορφή ημερομηνίας πρέπει να είναι ${inputFormat}`,
  pickDateFromCalendar: 'Επιλέξτε ημερομηνία από το ημερολόγιο',
  pm: 'μ.μ.',
  previous: 'Προηγούμενος',
  save: 'Αποθηκεύσετε',
  selectMultiple: 'Επιλέξτε ημερομηνίες',
  selectRange: 'Επιλέξτε περίοδο',
  selectSingle: 'Επιλέξτε ημερομηνία',
  toggleClock: 'Εναλλαγή ρολογιού',
  toggleKeyboard: 'Εναλλαγή πληκτρολογίου',
  typeInDate: 'Πληκτρολογήστε την ημερομηνία',
}
export default el
