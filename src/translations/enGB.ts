import type { TranslationsType } from './utils'

const enGB: TranslationsType = {
  am: 'AM',
  close: 'Close',
  dateIsDisabled: 'Day is not allowed',
  hour: 'Hour',
  minute: 'Minute',
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
  toggleKeyboard: 'Toggle keyboard',
  typeInDate: 'Type in date',
}
export default enGB
