import { registerTranslation, type TranslationsType } from './utils'

const hi: TranslationsType = {
  am: 'AM',
  cancel: 'रद्द करें',
  close: 'बंद करें',
  confirm: 'ठीक',
  dateIsDisabled: 'दिन की अनुमति नहीं है',
  endDate: 'समाप्ति तिथि',
  enterDate: 'तारीख दर्ज करें',
  enterDates: 'तारीखें दर्ज करें',
  hour: 'घंटा',
  hourOf: (hour, total) => `घंटा ${hour} / ${total}`,
  invalidTime: 'अमान्य समय',
  minute: 'मिनट',
  minuteOf: (minute, total) => `मिनट ${minute} / ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `${startDate} - ${endDate} के बीच होना चाहिए`,
  mustBeHigherThan: (date) => `${date} के बाद होना चाहिए`,
  mustBeLowerThan: (date) => `${date} से पहले होना चाहिए`,
  next: 'अगला',
  notAccordingToDateFormat: (inputFormat) =>
    `तारीख़ का प्रारूप ${inputFormat} होना चाहिए`,
  pickDateFromCalendar: 'कैलेंडर से तारीख़ चुनें',
  pm: 'PM',
  previous: 'पिछला',
  save: 'जमा करें',
  selectMultiple: 'तारीख़ें चुनें',
  selectRange: 'अवधि चुनें',
  selectSingle: 'तारीख़ चुनें',
  startDate: 'प्रारंभ तिथि',
  toggleClock: 'घड़ी बदलें',
  toggleKeyboard: 'कीबोर्ड बदलें',
  toggleScroll: 'स्क्रॉल बदलें',
  typeInDate: 'तारीख़ लिखें',
}

export default hi

registerTranslation('hi', hi)
