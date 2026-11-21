import type { TranslationsType } from './utils'

const en: TranslationsType = {
  am: 'AM',
  cancel: 'Cancel',
  close: 'Close',
  confirm: 'OK',
  dateIsDisabled: 'Day is not allowed',
  endDate: 'End date',
  enterDate: 'Enter date',
  enterDates: 'Enter dates',
  hour: 'Hour',
  hourOf: (hour, total) => `Hour ${hour} of ${total}`,
  invalidTime: 'Invalid time',
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
  startDate: 'Start date',
  toggleClock: 'Toggle dial picker',
  toggleKeyboard: 'Toggle input picker',
  toggleScroll: 'Toggle scroll picker',
  typeInDate: 'Type in date',
}

export default en
