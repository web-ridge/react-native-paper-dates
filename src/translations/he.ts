import type { TranslationsType } from './utils'

const he: TranslationsType = {
  save: 'שמור',
  selectSingle: 'בחר תאריך',
  selectMultiple: 'בחר תאריכים',
  selectRange: 'בחר טווח',
  notAccordingToDateFormat: (inputFormat) =>
    `פורמט של תאריך צריך להיות ${inputFormat}`,
  mustBeHigherThan: (date) => `חייב להיות אחרי ${date}`,
  mustBeLowerThan: (date) => `חייב להיות לפני ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `חייב להיות בין ${startDate} - ${endDate}`,
  dateIsDisabled: 'יום לא מורשה',
  previous: 'הקודם',
  next: 'הבא',
  typeInDate: 'הקש תאריך',
  pickDateFromCalendar: 'בחר תאריך מהלוח שנה',
  close: 'סגור',
  hour: 'שעה',
  minute: 'דקה',
}
export default he
