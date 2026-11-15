import type { TranslationsType } from './utils'

const he: TranslationsType = {
  am: 'AM',
  close: 'סגור',
  dateIsDisabled: 'יום לא מורשה',
  hour: 'שעה',
  hourOf: (hour, total) => `שעה ${hour} מתוך ${total}`,
  minute: 'דקה',
  minuteOf: (minute, total) => `דקה ${minute} מתוך ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `חייב להיות בין ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `חייב להיות אחרי ${date}`,
  mustBeLowerThan: (date) => `חייב להיות לפני ${date}`,
  next: 'הבא',
  notAccordingToDateFormat: (inputFormat) =>
    `פורמט של תאריך צריך להיות ${inputFormat}`,
  pickDateFromCalendar: 'בחר תאריך מהלוח שנה',
  pm: 'PM',
  previous: 'הקודם',
  save: 'שמור',
  selectMultiple: 'בחר תאריכים',
  selectRange: 'בחר טווח',
  selectSingle: 'בחר תאריך',
  toggleClock: 'החלף שעון',
  toggleKeyboard: 'החלף מקלדת',
  typeInDate: 'הקש תאריך',
}

export default he
