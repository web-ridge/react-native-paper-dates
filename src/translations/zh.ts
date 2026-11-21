import { registerTranslation, type TranslationsType } from './utils'

const zh: TranslationsType = {
  am: '上午',
  cancel: '取消',
  close: '关闭',
  confirm: '确定',
  dateIsDisabled: '日期不可选',
  endDate: '结束日期',
  enterDate: '输入日期',
  enterDates: '输入日期',
  hour: '小时',
  hourOf: (hour, total) => `小时 ${hour} / ${total}`,
  invalidTime: '时间无效',
  minute: '分钟',
  minuteOf: (minute, total) => `分钟 ${minute} / ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `必须在 ${startDate} - ${endDate} 之间`,
  mustBeHigherThan: (date) => `必须晚于 ${date}`,
  mustBeLowerThan: (date) => `必须早于 ${date}`,
  next: '下一个',
  notAccordingToDateFormat: (inputFormat) => `日期格式必须是 ${inputFormat}`,
  pickDateFromCalendar: '从日历中选择日期',
  pm: '下午',
  previous: '上一个',
  save: '保存',
  selectMultiple: '选择多个日期',
  selectRange: '选择期间',
  selectSingle: '选择日期',
  startDate: '开始日期',
  toggleClock: '切换时钟',
  toggleKeyboard: '切换键盘',
  toggleScroll: '切换滚动',
  typeInDate: '输入日期',
}

export default zh

registerTranslation('zh', zh)
