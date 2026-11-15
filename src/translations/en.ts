import type { TranslationsType } from './utils'

const en: TranslationsType = {
  am: 'AM',
  cancel: 'Cancel',
  close: 'Close',
  confirm: 'OK',
  dateIsDisabled: 'Day is not allowed',
  enterDate: 'Enter date',
  enterDates: 'Enter dates',
  hour: 'Hour',
  hourOf: (hour, total) => `Hour ${hour} of ${total}`,
  minute: 'Minute',
  minuteOf: (minute, total) => `Minute ${minute} of ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `Must be between ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Must be later than ${date}`,
  mustBeLowerThan: (date) => `Must be earlier than ${date}`,
  next: 'Next',
  notAccordingToDateFormat: (inputFormat) =>
    `Date format must be ${inputFormat}`,
  pickDateFromCalendar: 'Pick date from calendar',
  pm: 'PM',
  previous: 'Previous',
  save: 'Save',
  selectMultiple: 'Select dates',
  selectRange: 'Select period',
  selectSingle: 'Select date',
  toggleClock: 'Toggle clock',
  toggleKeyboard: 'Toggle keyboard',
  typeInDate: 'Type in date',
}

export default en
