import type { TranslationsType } from './utils'

const hi: TranslationsType = {
  am: 'AM',
  close: 'बंद करें',
  dateIsDisabled: 'दिन की अनुमति नहीं है',
  hour: 'घंटा',
  hourOf: (hour, total) => `घंटा ${hour} / ${total}`,
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
  toggleClock: 'घड़ी बदलें',
  toggleKeyboard: 'कीबोर्ड बदलें',
  typeInDate: 'तारीख़ लिखें',
}

export default hi
