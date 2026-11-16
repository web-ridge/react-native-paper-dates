import { registerTranslation, type TranslationsType } from './utils'

const ar: TranslationsType = {
  am: 'ص',
  cancel: 'إلغاء',
  close: 'أغلق',
  confirm: 'حسنًا',
  dateIsDisabled: 'اليوم غير مسموح به',
  enterDate: 'أدخل التاريخ',
  enterDates: 'أدخل التواريخ',
  hour: 'ساعة',
  hourOf: (hour, total) => `ساعة ${hour} من ${total}`,
  minute: 'دقيقة',
  minuteOf: (minute, total) => `دقيقة ${minute} من ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `يجب أن يكون بين ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `يجب أن يكون بعد  ${date}`,
  mustBeLowerThan: (date) => `يجب أن يكون قبل  ${date}`,
  next: 'التالي',
  notAccordingToDateFormat: (inputFormat: string) =>
    `يجب أن يكون تنسيق التاريخ ${inputFormat}`,
  pickDateFromCalendar: 'اختر التاريخ من التقويم',
  pm: 'م',
  previous: 'السابق',
  save: 'حفظ',
  selectMultiple: 'حدد التواريخ',
  selectRange: 'حدد الفترة',
  selectSingle: 'حدد تاريخ',
  toggleClock: 'تبديل الساعة',
  toggleKeyboard: 'تبديل لوحة المفاتيح',
  typeInDate: 'اكتب التاريخ',
}

export default ar

registerTranslation('ar', ar)
