import type { TranslationsType } from './utils'

const zh: TranslationsType = {
  save: '保存',
  selectSingle: '选择日期',
  selectMultiple: '选择多个日期',
  selectRange: '选择期间',
  notAccordingToDateFormat: (inputFormat) => `日期格式必须是 ${inputFormat}`,
  mustBeHigherThan: (date) => `必须晚于 ${date}`,
  mustBeLowerThan: (date) => `必须早于 ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `必须在 ${startDate} - ${endDate} 之间`,
  dateIsDisabled: '日期不可选',
  previous: '上一个',
  next: '下一个',
  typeInDate: '输入日期',
  pickDateFromCalendar: '从日历中选择日期',
  close: '关闭',
  hour: '小时',
  minute: '分钟',
}
export default zh
