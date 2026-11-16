import { registerTranslation, type TranslationsType } from './utils'

const zhTW: TranslationsType = {
  am: '上午',
  cancel: '取消',
  close: '關閉',
  confirm: '確定',
  dateIsDisabled: '日期不可選',
  enterDate: '輸入日期',
  enterDates: '輸入日期',
  hour: '小時',
  hourOf: (hour, total) => `小時 ${hour} / ${total}`,
  minute: '分鐘',
  minuteOf: (minute, total) => `分鐘 ${minute} / ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `必須在 ${startDate} - ${endDate} 之間`,
  mustBeHigherThan: (date) => `必須晚於 ${date}`,
  mustBeLowerThan: (date) => `必須早於 ${date}`,
  next: '下一個',
  notAccordingToDateFormat: (inputFormat) => `日期格式必須是 ${inputFormat}`,
  pickDateFromCalendar: '從日曆中選擇日期',
  pm: '下午',
  previous: '上一個',
  save: '保存',
  selectMultiple: '選擇多個日期',
  selectRange: '選擇期間',
  selectSingle: '選擇日期',
  toggleClock: '切換時鐘',
  toggleKeyboard: '切換鍵盤',
  typeInDate: '輸入日期',
}

export default zhTW

registerTranslation('zh-TW', zhTW)
