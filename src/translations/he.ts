import { registerTranslation, type TranslationsType } from './utils'

const he: TranslationsType = {
  am: 'AM',
  cancel: 'ביטול',
  close: 'סגור',
  confirm: 'אישור',
  dateIsDisabled: 'יום לא מורשה',
  enterDate: 'הזן תאריך',
  enterDates: 'הזן תאריכים',
  hour: 'שעה',
  hourOf: (hour, total) => `שעה ${hour} מתוך ${total}`,
  invalidTime: 'זמן לא תקין',
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

registerTranslation('he', he)
