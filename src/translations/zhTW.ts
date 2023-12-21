import type { TranslationsType } from './utils'

const zhTW: TranslationsType = {
  save: '保存',
  selectSingle: '選擇日期',
  selectMultiple: '選擇多個日期',
  selectRange: '選擇期間',
  notAccordingToDateFormat: (inputFormat) => `日期格式必須是 ${inputFormat}`,
  mustBeHigherThan: (date) => `必須晚於 ${date}`,
  mustBeLowerThan: (date) => `必須早於 ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `必須在 ${startDate} - ${endDate} 之間`,
  dateIsDisabled: '日期不可選',
  previous: '上一個',
  next: '下一個',
  typeInDate: '輸入日期',
  pickDateFromCalendar: '從日曆中選擇日期',
  close: '關閉',
  minute: '分鐘',
  hour: '小時',
}

export default zhTW
