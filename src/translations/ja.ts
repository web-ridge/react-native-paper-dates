import type { TranslationsType } from './utils'

const ja: TranslationsType = {
  save: '保存',
  selectSingle: '日付を選択',
  selectMultiple: '日付を選択',
  selectRange: '期間を選択',
  notAccordingToDateFormat: (inputFormat) =>
    `形式が無効です。使用：${inputFormat}`,
  mustBeHigherThan: (date) => `${date}より後にする必要があります`,
  mustBeLowerThan: (date) => `${date}より前にする必要があります`,
  mustBeBetween: (startDate, endDate) =>
    `${startDate} - ${endDate}の範囲で入力してください`,
  dateIsDisabled: '日付は入力できません',
  previous: '前へ',
  next: '次へ',
  typeInDate: '日付を入力',
  pickDateFromCalendar: 'カレンダーから日付を選択',
  close: '閉じる',
  minute: '分',
  hour: '時',
}
export default ja
