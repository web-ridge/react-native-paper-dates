import { registerTranslation, type TranslationsType } from './utils'

const el: TranslationsType = {
  am: 'π.μ.',
  cancel: 'Ακύρωση',
  close: 'Κλείσε',
  confirm: 'OK',
  dateIsDisabled: 'Ημέρα δεν επιτρέπεται',
  enterDate: 'Εισαγωγή ημερομηνίας',
  enterDates: 'Εισαγωγή ημερομηνιών',
  hour: 'ώρα',
  hourOf: (hour, total) => `Ώρα ${hour} από ${total}`,
  invalidTime: 'Μη έγκυρη ώρα',
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
  toggleScroll: 'Εναλλαγή κύλισης',
  typeInDate: 'Πληκτρολογήστε την ημερομηνία',
}

export default el

registerTranslation('el', el)
