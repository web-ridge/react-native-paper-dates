import type { TranslationsType } from './utils'

const hi: TranslationsType = {
  save: 'जमा करें',
  selectSingle: 'तारीख़ चुनें',
  selectMultiple: 'तारीख़ें चुनें',
  selectRange: 'अवधि चुनें',
  notAccordingToDateFormat: (inputFormat) =>
    `तारीख़ का प्रारूप ${inputFormat} होना चाहिए`,
  mustBeHigherThan: (date) => `${date} के बाद होना चाहिए`,
  mustBeLowerThan: (date) => `${date} से पहले होना चाहिए`,
  mustBeBetween: (startDate, endDate) =>
    `${startDate} - ${endDate} के बीच होना चाहिए`,
  dateIsDisabled: 'दिन की अनुमति नहीं है',
  previous: 'पिछला',
  next: 'अगला',
  typeInDate: 'तारीख़ लिखें',
  pickDateFromCalendar: 'कैलेंडर से तारीख़ चुनें',
  close: 'बंद करें',
  minute: 'मिनट',
  hour: 'घंटा',
}
export default hi
